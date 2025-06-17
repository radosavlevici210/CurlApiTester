import express, { Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../replitAuth';
import { aiOrchestrator } from '../services/ai-orchestrator';
import { collaborationEngine } from '../services/collaboration-engine';
import { db } from '../db';
import { users, businessTemplates, modelMetrics, analyticsEvents } from '../../shared/schema';
import { eq, desc, and, gte, count } from 'drizzle-orm';

const router = express.Router();

// Content Generation with Templates
const generateContentSchema = z.object({
  prompt: z.string().min(1),
  template: z.string().optional(),
  variables: z.record(z.any()).optional(),
  modelPreference: z.string().optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
  temperature: z.number().min(0).max(2).optional()
});

router.post('/generate-content', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { prompt, template, variables, modelPreference, maxTokens, temperature } = generateContentSchema.parse(req.body);
    
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await aiOrchestrator.generateContent(prompt, {
      userId: req.user.id,
      modelPreference,
      template,
      variables,
      maxTokens,
      temperature,
      userLicense: user.licenseType
    });

    res.json({
      success: true,
      content: result.content,
      metadata: {
        model: result.model,
        tokenUsage: result.tokenUsage,
        cost: result.cost,
        processingTime: result.processingTime
      }
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate content' });
  }
});

// Advanced Code Analysis
const analyzeCodeSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  analysisType: z.enum(['security', 'performance', 'quality', 'documentation'])
});

router.post('/analyze-code', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { code, language, analysisType } = analyzeCodeSchema.parse(req.body);
    
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const analysis = await aiOrchestrator.analyzeCode(
      code,
      language,
      analysisType,
      req.user.id,
      user.licenseType
    );

    res.json({
      success: true,
      analysis: analysis.analysis,
      suggestions: analysis.suggestions,
      score: analysis.score,
      issues: analysis.issues,
      metadata: {
        language,
        analysisType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ message: error.message || 'Failed to analyze code' });
  }
});

// Business Document Generation
const generateDocumentSchema = z.object({
  templateName: z.string().min(1),
  variables: z.record(z.any())
});

router.post('/generate-document', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { templateName, variables } = generateDocumentSchema.parse(req.body);
    
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await aiOrchestrator.generateBusinessDocument(
      templateName,
      variables,
      req.user.id,
      user.licenseType
    );

    res.json({
      success: true,
      document: result.document,
      template: result.template,
      wordCount: result.wordCount,
      metadata: {
        variables: Object.keys(variables),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate document' });
  }
});

// Get Business Templates
router.get('/templates', isAuthenticated, async (req: any, res: Response) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const templates = await db.select().from(businessTemplates)
      .where(eq(businessTemplates.isPublic, true))
      .orderBy(desc(businessTemplates.usageCount));

    // Filter by license
    const accessibleTemplates = templates.filter(template => {
      const licenseHierarchy = { free: 0, pro: 1, enterprise: 2 };
      return licenseHierarchy[user.licenseType] >= licenseHierarchy[template.licenseRequired];
    });

    res.json({
      success: true,
      templates: accessibleTemplates.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        variables: template.variables,
        licenseRequired: template.licenseRequired,
        usageCount: template.usageCount
      }))
    });
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

// Collaboration Session Management
const createSessionSchema = z.object({
  conversationId: z.number(),
  sessionName: z.string().min(1),
  participants: z.array(z.string()).optional()
});

router.post('/collaboration/create', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { conversationId, sessionName, participants = [] } = createSessionSchema.parse(req.body);
    
    const sessionId = await collaborationEngine.createSession(
      conversationId,
      req.user.id,
      sessionName,
      participants
    );

    res.json({
      success: true,
      sessionId,
      message: 'Collaboration session created successfully'
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ message: 'Failed to create collaboration session' });
  }
});

// Join Collaboration Session
router.post('/collaboration/:sessionId/join', isAuthenticated, async (req: any, res: Response) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    // This would typically be handled by WebSocket connection
    // Here we provide session info for frontend
    const sessionInfo = await collaborationEngine.getSessionInfo(sessionId);
    
    if (!sessionInfo) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({
      success: true,
      session: sessionInfo.session,
      participants: sessionInfo.participants,
      conversation: sessionInfo.conversation
    });
  } catch (error) {
    console.error('Session join error:', error);
    res.status(500).json({ message: 'Failed to join session' });
  }
});

// User Performance Analytics
router.get('/analytics/performance', isAuthenticated, async (req: any, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const metrics = await aiOrchestrator.getModelPerformanceMetrics(req.user.id, days);

    // Get recent activity
    const recentEvents = await db.select().from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.userId, req.user.id),
        gte(analyticsEvents.timestamp, new Date(Date.now() - days * 24 * 60 * 60 * 1000))
      ))
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(100);

    // Aggregate by event type
    const eventSummary = recentEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      period: `${days} days`,
      aiUsage: metrics,
      activitySummary: eventSummary,
      recentActivity: recentEvents.slice(0, 20)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Advanced Search and Insights
const searchSchema = z.object({
  query: z.string().min(1),
  filters: z.object({
    category: z.string().optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional(),
    models: z.array(z.string()).optional()
  }).optional()
});

router.post('/search', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { query, filters = {} } = searchSchema.parse(req.body);
    
    // Search across conversations, templates, and analytics
    const searchResults = {
      conversations: [], // Would implement conversation search
      templates: await db.select().from(businessTemplates)
        .where(eq(businessTemplates.isPublic, true))
        .limit(10),
      insights: [] // Would implement AI-powered insights
    };

    res.json({
      success: true,
      query,
      results: searchResults,
      totalResults: searchResults.conversations.length + searchResults.templates.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Failed to perform search' });
  }
});

// Model Health and Status
router.get('/models/status', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Get model performance over last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const modelHealth = await db.select().from(modelMetrics)
      .where(gte(modelMetrics.date, last24h))
      .orderBy(desc(modelMetrics.date));

    // Aggregate health data
    const healthSummary = modelHealth.reduce((acc, metric) => {
      const modelId = metric.modelId?.toString() || 'unknown';
      if (!acc[modelId]) {
        acc[modelId] = {
          requests: 0,
          avgResponseTime: 0,
          totalTokens: 0,
          avgSatisfaction: 0,
          satisfactionCount: 0
        };
      }
      
      acc[modelId].requests++;
      acc[modelId].avgResponseTime += metric.responseTime || 0;
      acc[modelId].totalTokens += metric.tokenUsage || 0;
      
      if (metric.userSatisfaction) {
        acc[modelId].avgSatisfaction += metric.userSatisfaction;
        acc[modelId].satisfactionCount++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(healthSummary).forEach((model: any) => {
      model.avgResponseTime = Math.round(model.avgResponseTime / model.requests);
      if (model.satisfactionCount > 0) {
        model.avgSatisfaction = (model.avgSatisfaction / model.satisfactionCount).toFixed(1);
      }
    });

    res.json({
      success: true,
      period: '24 hours',
      models: healthSummary,
      systemStatus: 'operational', // Would implement actual health checks
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Model status error:', error);
    res.status(500).json({ message: 'Failed to fetch model status' });
  }
});

export default router;