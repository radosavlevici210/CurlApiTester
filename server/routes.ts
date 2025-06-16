import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { grokService } from "./services/grok";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  chatCompletionSchema, 
  insertConversationSchema, 
  insertMessageSchema,
  updateConversationSchema,
  ENTERPRISE_LICENSE
} from "@shared/schema";
import { z } from "zod";

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
          const assistantContent = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
          
          // Save assistant message
          await storage.createMessage({
            conversationId: conversationId!,
            role: "assistant",
            content: assistantContent,
          });
          
          res.json({
            content: assistantContent,
            conversationId,
            usage: response.usage
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

  // Export conversation
  app.get("/api/conversations/:id/export", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await storage.getConversation(id);
      const messages = await storage.getMessagesByConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const exportData = {
        title: conversation.title,
        model: conversation.model,
        temperature: conversation.temperature / 100,
        systemPrompt: conversation.systemPrompt,
        createdAt: conversation.createdAt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt
        }))
      };

      res.json(exportData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
