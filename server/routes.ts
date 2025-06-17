import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { grokService } from "./services/grok";
import { enhancedGrokService } from "./services/enhanced-grok";
import { advancedAI } from "./services/advanced-ai";
import { visualizationService } from "./services/visualization";
import { githubService } from "./services/github-integration";
import { aiFeaturesService } from "./services/ai-features";
import { enterpriseMonitoring } from "./services/enterprise-monitoring";
import { productionOptimization } from "./services/production-optimization";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  chatCompletionSchema, 
  insertConversationSchema, 
  insertMessageSchema,
  updateConversationSchema,
  ENTERPRISE_LICENSE
} from "@shared/schema";
import { z } from "zod";
import documents from "./routes/documents.js";

interface ChatRequest extends Request {
  body: z.infer<typeof chatCompletionSchema>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // License and copyright endpoint
  app.get("/api/license", (req: Request, res: Response) => {
    res.json(ENTERPRISE_LICENSE);
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all conversations
  app.get("/api/conversations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get a specific conversation with messages
  app.get("/api/conversations/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const conversation = await storage.getConversation(id);

      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(id);
      res.json({ conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        userId,
      });

      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ error: "Failed to create conversation" });
    }
  });

  // Update conversation
  app.patch("/api/conversations/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const validatedData = updateConversationSchema.parse(req.body);

      // Verify ownership
      const existing = await storage.getConversation(id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const conversation = await storage.updateConversation(id, validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(400).json({ error: "Failed to update conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Verify ownership
      const existing = await storage.getConversation(id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const deleted = await storage.deleteConversation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Chat completion endpoint with streaming support
  app.post("/api/chat/completions", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = chatCompletionSchema.parse(req.body);

      // Get existing messages if conversationId provided
      let messages: Array<{role: string, content: string}> = [];
      let conversationId = validatedData.conversationId;

      if (conversationId) {
        const conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== userId) {
          return res.status(404).json({ error: "Conversation not found" });
        }

        const existingMessages = await storage.getMessagesByConversation(conversationId);
        messages = existingMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      } else {
        // Create new conversation
        const conversation = await storage.createConversation({
          title: validatedData.message.substring(0, 50) + (validatedData.message.length > 50 ? "..." : ""),
          userId,
          systemPrompt: validatedData.systemPrompt || "You are a helpful AI assistant.",
          model: validatedData.model,
          temperature: Math.round(validatedData.temperature * 100),
          maxTokens: validatedData.maxTokens,
          isPrivate: validatedData.isPrivate,
          visualizationEnabled: validatedData.enableVisualization,
          githubRepoConnected: validatedData.githubRepo,
        });
        conversationId = conversation.id;
      }

      // Add user message
      const userMessage = await storage.createMessage({
        conversationId: conversationId!,
        userId,
        role: "user",
        content: validatedData.message,
        attachments: validatedData.attachments || [],
      });

      messages.push({
        role: "user",
        content: validatedData.message
      });

      if (validatedData.stream) {
        // Set up Server-Sent Events
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Cache-Control"
        });

        let assistantContent = "";

        try {
          const stream = grokService.createStreamingCompletion(validatedData, messages);

          for await (const chunk of stream) {
            assistantContent += chunk;
            res.write(`data: ${JSON.stringify({ content: chunk, conversationId })}\n\n`);
          }

          // Save complete assistant message
          await storage.createMessage({
            conversationId: conversationId!,
            userId,
            role: "assistant",
            content: assistantContent,
          });

          res.write(`data: [DONE]\n\n`);
        } catch (error) {
          console.error("Streaming error:", error);
          res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
        }

        res.end();
      } else {
        // Non-streaming response
        try {
          const response = await grokService.createChatCompletion(validatedData, messages);
          const assistantContent = (response as any).choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

          // Save assistant message
          await storage.createMessage({
            conversationId: conversationId!,
            userId,
            role: "assistant",
            content: assistantContent,
          });

          res.json({
            content: assistantContent,
            conversationId,
            usage: (response as any).usage
          });
        } catch (error) {
          console.error("Chat completion error:", error);
          res.status(500).json({ error: "Failed to generate response" });
        }
      }
    } catch (error) {
      console.error("Chat request error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Notifications endpoint
  app.get("/api/notifications", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unread === 'true';
      const notifications = await storage.getUserNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Device management
  app.get("/api/devices", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await storage.getUserDevices(userId);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  // Enhanced AI Analysis with xAI Grok
  app.post("/api/ai/analyze-code", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { code, language } = req.body;
      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }
      const analysis = await enhancedGrokService.codeAnalysis(code, language);
      res.json(analysis);
    } catch (error) {
      console.error("Code analysis error:", error);
      res.status(500).json({ error: "Failed to analyze code" });
    }
  });

  // Text summarization
  app.post("/api/ai/summarize", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const summary = await enhancedGrokService.summarizeText(text);
      res.json({ summary });
    } catch (error) {
      console.error("Summarization error:", error);
      res.status(500).json({ error: "Failed to summarize text" });
    }
  });

  // Sentiment analysis
  app.post("/api/ai/sentiment", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const sentiment = await enhancedGrokService.analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      res.status(500).json({ error: "Failed to analyze sentiment" });
    }
  });

  // Problem solving
  app.post("/api/ai/solve-problem", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { problem, domain } = req.body;
      if (!problem) {
        return res.status(400).json({ error: "Problem description is required" });
      }
      const solution = await enhancedGrokService.solveComplexProblem(problem, domain);
      res.json(solution);
    } catch (error) {
      console.error("Problem solving error:", error);
      res.status(500).json({ error: "Failed to solve problem" });
    }
  });

  app.post("/api/ai/generate-content", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { template, context } = req.body;
      const content = await advancedAI.generateContent(template, context);
      res.json({ content });
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  app.post("/api/ai/multimodal-analysis", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { text, imageBase64 } = req.body;
      const analysis = await advancedAI.analyzeMultiModal(text, imageBase64);
      res.json(analysis);
    } catch (error) {
      console.error("Multimodal analysis error:", error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  // AI Features Endpoints
  app.post("/api/ai/generate-code", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { prompt, language, includeTests, includeDocumentation } = req.body;

      if (!prompt || !language) {
        return res.status(400).json({ error: "Prompt and language are required" });
      }

      const result = await aiFeaturesService.generateCode(prompt, language, includeTests, includeDocumentation);
      res.json(result);
    } catch (error: any) {
      console.error("Code generation error:", error);
      res.status(500).json({ error: error.message || "Code generation failed" });
    }
  });

  app.post("/api/ai/explain-concept", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { concept, level, context } = req.body;

      if (!concept || !level) {
        return res.status(400).json({ error: "Concept and level are required" });
      }

      const result = await aiFeaturesService.explainConcept(concept, level, context);
      res.json(result);
    } catch (error: any) {
      console.error("Concept explanation error:", error);
      res.status(500).json({ error: error.message || "Explanation failed" });
    }
  });

  app.post("/api/ai/debug-code", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { code, error, language } = req.body;

      if (!code || !error || !language) {
        return res.status(400).json({ error: "Code, error, and language are required" });
      }

      const result = await aiFeaturesService.debugCode(code, error, language);
      res.json(result);
    } catch (error: any) {
      console.error("Code debugging error:", error);
      res.status(500).json({ error: error.message || "Debugging failed" });
    }
  });

  app.post("/api/ai/plan-project", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { description, timeline, complexity } = req.body;

      if (!description || !timeline || !complexity) {
        return res.status(400).json({ error: "Description, timeline, and complexity are required" });
      }

      const result = await aiFeaturesService.planProject(description, timeline, complexity);
      res.json(result);
    } catch (error: any) {
      console.error("Project planning error:", error);
      res.status(500).json({ error: error.message || "Project planning failed" });
    }
  });

  app.post("/api/ai/generate-creative-content", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { type, prompt, tone, length } = req.body;

      if (!type || !prompt || !tone || !length) {
        return res.status(400).json({ error: "Type, prompt, tone, and length are required" });
      }

      const result = await aiFeaturesService.generateContent(type, prompt, tone, length);
      res.json(result);
    } catch (error: any) {
      console.error("Content generation error:", error);
      res.status(500).json({ error: error.message || "Content generation failed" });
    }
  });

  app.get("/api/ai/test-connection", isAuthenticated, async (req: any, res: Response) => {
    try {
      const result = await aiFeaturesService.testConnection();
      res.json(result);
    } catch (error: any) {
      console.error("Connection test error:", error);
      res.status(500).json({ error: error.message || "Connection test failed" });
    }
  });

  app.post("/api/ai/solve-problem", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { problem, context } = req.body;
      const solution = await advancedAI.solveComplexProblem(problem, context);
      res.json(solution);
    } catch (error) {
      console.error("Problem solving error:", error);
      res.status(500).json({ error: "Failed to solve problem" });
    }
  });

  // Visualization APIs
  app.get("/api/analytics/conversations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUser(userId);
      const allMessages = await Promise.all(
        conversations.map(conv => storage.getMessagesByConversation(conv.id))
      );
      const messages = allMessages.flat();

      const analytics = visualizationService.generateConversationAnalytics(conversations, messages);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to generate analytics" });
    }
  });

  app.get("/api/analytics/collaboration", isAuthenticated, async (req: any, res: Response) => {
    try {
      // Mock collaboration data - in production, get from real user activity
      const userIds = [req.user.claims.sub];
      const activities = [];
      const collaborationMap = visualizationService.generateCollaborationMap(userIds, activities);
      res.json(collaborationMap);
    } catch (error) {
      console.error("Collaboration analytics error:", error);
      res.status(500).json({ error: "Failed to generate collaboration analytics" });
    }
  });

  // GitHub Integration APIs
  app.post("/api/github/connect", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { accessToken } = req.body;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const result = await githubService.connectGitHub(user, accessToken);
      res.json(result);
    } catch (error) {
      console.error("GitHub connection error:", error);
      res.status(500).json({ error: "Failed to connect GitHub" });
    }
  });

  app.get("/api/github/repositories", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { accessToken, page = 1, per_page = 30 } = req.query;
      const repositories = await githubService.getUserRepositories(accessToken, page, per_page);
      res.json(repositories);
    } catch (error) {
      console.error("GitHub repositories error:", error);
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  app.post("/api/github/analyze-repo", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { accessToken, owner, repo } = req.body;
      const analysis = await githubService.analyzeRepository(accessToken, owner, repo);
      res.json(analysis);
    } catch (error) {
      console.error("Repository analysis error:", error);
      res.status(500).json({ error: "Failed to analyze repository" });
    }
  });

  // Real-time Collaboration
  app.post("/api/collaboration/suggest", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { content, userRole, context } = req.body;
      const suggestions = await advancedAI.getCollaborativeSuggestions(content, userRole, context);
      res.json(suggestions);
    } catch (error) {
      console.error("Collaboration suggestions error:", error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  // Enterprise Monitoring Endpoints
  app.get("/api/monitoring/health", async (req: Request, res: Response) => {
    try {
      const health = enterpriseMonitoring.generateHealthReport();
      res.json(health);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ error: "Health check failed" });
    }
  });

  app.get("/api/monitoring/metrics", isAuthenticated, async (req: any, res: Response) => {
    try {
      const timeRange = req.query.range as '1h' | '6h' | '24h' | '7d' || '1h';
      const metrics = enterpriseMonitoring.getMetrics(timeRange);
      res.json({ metrics, summary: enterpriseMonitoring.getCurrentMetrics() });
    } catch (error) {
      console.error("Metrics error:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/monitoring/alerts", isAuthenticated, async (req: any, res: Response) => {
    try {
      const type = req.query.type as any;
      const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined;
      const alerts = enterpriseMonitoring.getAlerts(type, resolved);
      res.json(alerts);
    } catch (error) {
      console.error("Alerts error:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/monitoring/alerts/:id/resolve", isAuthenticated, async (req: any, res: Response) => {
    try {
      const alertId = req.params.id;
      const resolved = enterpriseMonitoring.resolveAlert(alertId);
      res.json({ success: resolved });
    } catch (error) {
      console.error("Alert resolution error:", error);
      res.status(500).json({ error: "Failed to resolve alert" });
    }
  });

  app.get("/api/performance/cache-stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const stats = productionOptimization.getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error("Cache stats error:", error);
      res.status(500).json({ error: "Failed to fetch cache stats" });
    }
  });

  app.get("/api/performance/optimization", isAuthenticated, async (req: any, res: Response) => {
    try {
      const memoryCheck = productionOptimization.checkMemoryUsage();
      const healthCheck = productionOptimization.createHealthCheck();
      res.json({ memory: memoryCheck, health: healthCheck });
    } catch (error) {
      console.error("Performance optimization error:", error);
      res.status(500).json({ error: "Failed to fetch optimization data" });
    }
  });

  // Export conversation
  app.get("/api/conversations/:id/export", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const conversation = await storage.getConversation(id);

      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(id);

      const exportData = {
        title: conversation.title,
        model: conversation.model,
        temperature: (conversation.temperature || 70) / 100,
        systemPrompt: conversation.systemPrompt,
        createdAt: conversation.createdAt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt
        })),
        license: "Enterprise License - © 2025 ervin210@icloud.com"
      };

      res.json(exportData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export conversation" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time synchronization
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const userConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket, req) => {
    let userId: string | null = null;

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'auth' && data.userId) {
          userId = data.userId;

          if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set());
          }
          userConnections.get(userId)!.add(ws);

          // Update device activity
          if (data.deviceId) {
            await storage.updateDeviceActivity(data.deviceId);
          }

          ws.send(JSON.stringify({ type: 'auth_success' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId && userConnections.has(userId)) {
        userConnections.get(userId)!.delete(ws);
        if (userConnections.get(userId)!.size === 0) {
          userConnections.delete(userId);
        }
      }
    });
  });

  app.use("/api/documents", documents);
  return httpServer;
}