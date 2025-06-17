import express, { Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../replitAuth';
import { OpenAIService } from '../services/openai-service';
import { db } from '../db';
import { users, analyticsEvents } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Enhanced chat completion with Grok
const chatSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
  systemPrompt: z.string().optional()
});

router.post('/chat', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { prompt, model, temperature, maxTokens, systemPrompt } = chatSchema.parse(req.body);
    
    const response = await OpenAIService.askGrok(prompt, {
      model,
      temperature,
      maxTokens,
      systemPrompt
    });

    // Log analytics
    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'openai_chat_completion',
      eventData: {
        model: model || 'gpt-4o',
        promptLength: prompt.length,
        responseLength: response?.length || 0
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      response,
      metadata: {
        model: model || 'gpt-4o',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ message: 'Failed to process chat request' });
  }
});

// Multi-modal image analysis
const imageAnalysisSchema = z.object({
  imageBase64: z.string().min(1),
  prompt: z.string().min(1),
  model: z.string().optional()
});

router.post('/analyze-image', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { imageBase64, prompt, model } = imageAnalysisSchema.parse(req.body);
    
    const analysis = await OpenAIService.analyzeImageWithText(imageBase64, prompt, { model });

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'image_analysis',
      eventData: {
        model: model || 'gpt-4o',
        promptLength: prompt.length,
        hasImage: true
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      analysis,
      metadata: {
        model: model || 'gpt-4o',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze image' });
  }
});

// Code analysis with multiple types
const codeAnalysisSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  analysisType: z.enum(['security', 'performance', 'quality', 'bugs'])
});

router.post('/analyze-code', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { code, language, analysisType } = codeAnalysisSchema.parse(req.body);
    
    const analysis = await OpenAIService.analyzeCode(code, language, analysisType);

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'code_analysis',
      eventData: {
        language,
        analysisType,
        codeLength: code.length
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      analysis,
      metadata: {
        language,
        analysisType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze code' });
  }
});

// Business document generation
const documentSchema = z.object({
  documentType: z.enum(['proposal', 'report', 'email', 'contract']),
  context: z.record(z.any()),
  requirements: z.string().optional()
});

router.post('/generate-document', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { documentType, context, requirements } = documentSchema.parse(req.body);
    
    const document = await OpenAIService.generateBusinessDocument(documentType, context, requirements);

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'document_generation',
      eventData: {
        documentType,
        contextKeys: Object.keys(context),
        hasRequirements: !!requirements
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      document,
      metadata: {
        documentType,
        wordCount: document?.split(' ').length || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ message: 'Failed to generate document' });
  }
});

// Creative content generation
const creativeContentSchema = z.object({
  contentType: z.enum(['story', 'article', 'marketing', 'social']),
  topic: z.string().min(1),
  tone: z.enum(['professional', 'casual', 'technical', 'creative']),
  length: z.enum(['short', 'medium', 'long'])
});

router.post('/generate-content', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { contentType, topic, tone, length } = creativeContentSchema.parse(req.body);
    
    const content = await OpenAIService.generateCreativeContent(contentType, topic, tone, length);

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'creative_content_generation',
      eventData: {
        contentType,
        tone,
        length,
        topicLength: topic.length
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      content,
      metadata: {
        contentType,
        tone,
        length,
        wordCount: content?.split(' ').length || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ message: 'Failed to generate content' });
  }
});

// Sentiment analysis
const sentimentSchema = z.object({
  text: z.string().min(1)
});

router.post('/analyze-sentiment', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { text } = sentimentSchema.parse(req.body);
    
    const sentiment = await OpenAIService.analyzeSentiment(text);

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'sentiment_analysis',
      eventData: {
        textLength: text.length,
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      sentiment,
      metadata: {
        textLength: text.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze sentiment' });
  }
});

// Text summarization
const summarizeSchema = z.object({
  text: z.string().min(1),
  length: z.enum(['brief', 'medium', 'detailed']).optional(),
  focus: z.string().optional()
});

router.post('/summarize', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { text, length, focus } = summarizeSchema.parse(req.body);
    
    const summary = await OpenAIService.summarizeText(text, { length, focus });

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'text_summarization',
      eventData: {
        originalLength: text.length,
        summaryLength: summary?.length || 0,
        summaryType: length || 'medium',
        hasFocus: !!focus
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      summary,
      metadata: {
        originalLength: text.length,
        summaryLength: summary?.length || 0,
        compressionRatio: ((summary?.length || 0) / text.length * 100).toFixed(1) + '%',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ message: 'Failed to summarize text' });
  }
});

// Language translation
const translateSchema = z.object({
  text: z.string().min(1),
  targetLanguage: z.string().min(1),
  sourceLanguage: z.string().optional()
});

router.post('/translate', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = translateSchema.parse(req.body);
    
    const translation = await OpenAIService.translateText(text, targetLanguage, sourceLanguage);

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'text_translation',
      eventData: {
        sourceLanguage: sourceLanguage || 'auto-detect',
        targetLanguage,
        textLength: text.length
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      translation,
      metadata: {
        sourceLanguage: sourceLanguage || 'auto-detect',
        targetLanguage,
        originalLength: text.length,
        translatedLength: translation?.length || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: 'Failed to translate text' });
  }
});

// Question answering
const questionSchema = z.object({
  question: z.string().min(1),
  context: z.string().optional(),
  detailed: z.boolean().optional(),
  sources: z.boolean().optional()
});

router.post('/answer-question', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { question, context, detailed, sources } = questionSchema.parse(req.body);
    
    const answer = await OpenAIService.answerQuestion(question, context, { detailed, sources });

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'question_answering',
      eventData: {
        questionLength: question.length,
        hasContext: !!context,
        detailed: detailed || false,
        includeSources: sources || false
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      answer,
      metadata: {
        questionLength: question.length,
        answerLength: answer?.length || 0,
        hasContext: !!context,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Question answering error:', error);
    res.status(500).json({ message: 'Failed to answer question' });
  }
});

// Structured data extraction
const structuredDataSchema = z.object({
  prompt: z.string().min(1),
  schema: z.string().min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional()
});

router.post('/extract-structured-data', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { prompt, schema, model, temperature } = structuredDataSchema.parse(req.body);
    
    const data = await OpenAIService.getStructuredResponse(prompt, schema, { model, temperature });

    await db.insert(analyticsEvents).values({
      userId: req.user.id,
      eventType: 'structured_data_extraction',
      eventData: {
        promptLength: prompt.length,
        schemaLength: schema.length,
        model: model || 'gpt-4o'
      },
      sessionId: `session_${Date.now()}`
    });

    res.json({
      success: true,
      data,
      metadata: {
        model: model || 'gpt-4o',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Structured data extraction error:', error);
    res.status(500).json({ message: 'Failed to extract structured data' });
  }
});

// Get user's AI usage statistics
router.get('/usage-stats', isAuthenticated, async (req: any, res: Response) => {
  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get recent analytics events
    const events = await db.select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.userId, req.user.id))
      .orderBy(analyticsEvents.timestamp);

    // Aggregate statistics
    const stats = events.reduce((acc, event) => {
      acc.totalRequests++;
      acc.eventTypes[event.eventType] = (acc.eventTypes[event.eventType] || 0) + 1;
      return acc;
    }, {
      totalRequests: 0,
      eventTypes: {} as Record<string, number>,
      last30Days: events.filter(e => new Date(e.timestamp) >= last30Days).length
    });

    res.json({
      success: true,
      stats,
      period: 'All time',
      last30Days: stats.last30Days
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({ message: 'Failed to get usage statistics' });
  }
});

export default router;