import OpenAI from 'openai';
import { db } from '../db';
import { aiModels, modelMetrics, analyticsEvents, businessTemplates } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

interface AIModelConfig {
  id: number;
  name: string;
  provider: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
  licenseRequired: string;
}

interface BusinessTemplate {
  id: number;
  name: string;
  category: string;
  template: string;
  variables: any;
}

export class AIOrchestrator {
  private openaiClient: OpenAI;
  private models: Map<string, AIModelConfig> = new Map();
  private templates: Map<string, BusinessTemplate> = new Map();

  constructor() {
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
    });
    this.loadModelsAndTemplates();
  }

  private async loadModelsAndTemplates() {
    try {
      // Load AI models
      const models = await db.select().from(aiModels).where(eq(aiModels.isActive, true));
      models.forEach(model => {
        this.models.set(model.provider + ':' + model.modelId, {
          id: model.id,
          name: model.name,
          provider: model.provider,
          modelId: model.modelId,
          maxTokens: model.maxTokens || 4096,
          temperature: parseFloat(model.temperature || '0.7'),
          systemPrompt: model.systemPrompt || undefined,
          licenseRequired: model.licenseRequired || 'free'
        });
      });

      // Load business templates
      const templates = await db.select().from(businessTemplates);
      templates.forEach(template => {
        this.templates.set(template.category + ':' + template.name, template);
      });
    } catch (error) {
      console.error('Failed to load models and templates:', error);
    }
  }

  async generateContent(
    prompt: string,
    options: {
      userId: string;
      modelPreference?: string;
      template?: string;
      variables?: Record<string, any>;
      maxTokens?: number;
      temperature?: number;
      userLicense: string;
    }
  ): Promise<{
    content: string;
    model: string;
    tokenUsage: number;
    cost: string;
    processingTime: number;
  }> {
    const startTime = Date.now();
    
    // Select appropriate model based on license and preference
    const model = this.selectOptimalModel(options.userLicense, options.modelPreference);
    
    // Apply template if specified
    let finalPrompt = prompt;
    if (options.template) {
      const template = this.getTemplate(options.template);
      if (template) {
        finalPrompt = this.applyTemplate(template, options.variables || {}, prompt);
      }
    }

    try {
      const completion = await this.openaiClient.chat.completions.create({
        model: model.modelId,
        messages: [
          ...(model.systemPrompt ? [{ role: 'system' as const, content: model.systemPrompt }] : []),
          { role: 'user' as const, content: finalPrompt }
        ],
        max_tokens: options.maxTokens || model.maxTokens,
        temperature: options.temperature || model.temperature,
      });

      const processingTime = Date.now() - startTime;
      const tokenUsage = completion.usage?.total_tokens || 0;
      const cost = this.calculateCost(model.provider, tokenUsage);

      // Log metrics
      await this.logMetrics({
        modelId: model.id,
        userId: options.userId,
        responseTime: processingTime,
        tokenUsage,
        cost,
      });

      // Log analytics event
      await this.logAnalyticsEvent({
        userId: options.userId,
        eventType: 'ai_content_generated',
        eventData: {
          model: model.name,
          tokenUsage,
          processingTime,
          template: options.template
        }
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        model: model.name,
        tokenUsage,
        cost,
        processingTime
      };
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  }

  async analyzeCode(
    code: string,
    language: string,
    analysisType: 'security' | 'performance' | 'quality' | 'documentation',
    userId: string,
    userLicense: string
  ): Promise<{
    analysis: string;
    suggestions: string[];
    score: number;
    issues: any[];
  }> {
    const model = this.selectOptimalModel(userLicense, 'code-analysis');
    
    const systemPrompts = {
      security: 'You are a security expert. Analyze the code for security vulnerabilities, potential exploits, and security best practices.',
      performance: 'You are a performance optimization expert. Analyze the code for performance bottlenecks, inefficiencies, and optimization opportunities.',
      quality: 'You are a code quality expert. Analyze the code for maintainability, readability, design patterns, and best practices.',
      documentation: 'You are a documentation expert. Analyze the code and suggest comprehensive documentation improvements.'
    };

    const prompt = `Analyze this ${language} code for ${analysisType}:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Overall analysis
2. Specific suggestions for improvement
3. A score from 1-100
4. List of issues with severity levels

Format your response as JSON with keys: analysis, suggestions, score, issues`;

    try {
      const completion = await this.openaiClient.chat.completions.create({
        model: model.modelId,
        messages: [
          { role: 'system' as const, content: systemPrompts[analysisType] },
          { role: 'user' as const, content: prompt }
        ],
        max_tokens: model.maxTokens,
        temperature: 0.3, // Lower temperature for analysis
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(response);

      await this.logAnalyticsEvent({
        userId,
        eventType: 'code_analysis',
        eventData: {
          language,
          analysisType,
          score: parsed.score,
          issueCount: parsed.issues?.length || 0
        }
      });

      return parsed;
    } catch (error) {
      console.error('Code analysis failed:', error);
      throw new Error('Failed to analyze code. Please try again.');
    }
  }

  async generateBusinessDocument(
    templateName: string,
    variables: Record<string, any>,
    userId: string,
    userLicense: string
  ): Promise<{
    document: string;
    template: string;
    wordCount: number;
  }> {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error('Template not found');
    }

    if (!this.hasLicenseForTemplate(userLicense, template.licenseRequired)) {
      throw new Error('Insufficient license for this template');
    }

    const model = this.selectOptimalModel(userLicense);
    const document = this.applyTemplate(template, variables);

    // Enhance document with AI
    const completion = await this.openaiClient.chat.completions.create({
      model: model.modelId,
      messages: [
        { role: 'system', content: 'You are a professional business writer. Enhance and polish the provided document while maintaining its structure and key information.' },
        { role: 'user', content: `Please enhance this business document:\n\n${document}` }
      ],
      max_tokens: model.maxTokens,
      temperature: 0.7,
    });

    const enhancedDocument = completion.choices[0]?.message?.content || document;
    const wordCount = enhancedDocument.split(/\s+/).length;

    // Update template usage
    await db.update(businessTemplates)
      .set({ usageCount: template.usageCount + 1 })
      .where(eq(businessTemplates.id, template.id));

    await this.logAnalyticsEvent({
      userId,
      eventType: 'business_document_generated',
      eventData: {
        template: templateName,
        wordCount,
        variables: Object.keys(variables)
      }
    });

    return {
      document: enhancedDocument,
      template: templateName,
      wordCount
    };
  }

  private selectOptimalModel(userLicense: string, preference?: string): AIModelConfig {
    const availableModels = Array.from(this.models.values()).filter(model => 
      this.hasLicenseForModel(userLicense, model.licenseRequired)
    );

    if (preference) {
      const preferredModel = availableModels.find(model => 
        model.name.toLowerCase().includes(preference.toLowerCase()) ||
        model.modelId.toLowerCase().includes(preference.toLowerCase())
      );
      if (preferredModel) return preferredModel;
    }

    // Default to best available model for license
    return availableModels[0] || this.getDefaultModel();
  }

  private getDefaultModel(): AIModelConfig {
    return {
      id: 0,
      name: 'Grok-Beta',
      provider: 'xai',
      modelId: 'grok-beta',
      maxTokens: 4096,
      temperature: 0.7,
      licenseRequired: 'free'
    };
  }

  private hasLicenseForModel(userLicense: string, requiredLicense: string): boolean {
    const licenseHierarchy = { free: 0, pro: 1, enterprise: 2 };
    return licenseHierarchy[userLicense] >= licenseHierarchy[requiredLicense];
  }

  private hasLicenseForTemplate(userLicense: string, requiredLicense: string): boolean {
    return this.hasLicenseForModel(userLicense, requiredLicense);
  }

  private getTemplate(templateName: string): BusinessTemplate | undefined {
    for (const [key, template] of this.templates) {
      if (key.includes(templateName) || template.name === templateName) {
        return template;
      }
    }
    return undefined;
  }

  private applyTemplate(template: BusinessTemplate, variables: Record<string, any>, additionalContent?: string): string {
    let content = template.template;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    });

    // Add additional content if provided
    if (additionalContent) {
      content += '\n\n' + additionalContent;
    }

    return content;
  }

  private calculateCost(provider: string, tokens: number): string {
    const rates = {
      xai: 0.00002, // $0.00002 per token
      openai: 0.00003,
      anthropic: 0.00002,
    };
    
    const rate = rates[provider] || rates.xai;
    return (tokens * rate).toFixed(6);
  }

  private async logMetrics(data: {
    modelId: number;
    userId: string;
    responseTime: number;
    tokenUsage: number;
    cost: string;
  }) {
    try {
      await db.insert(modelMetrics).values({
        modelId: data.modelId,
        userId: data.userId,
        responseTime: data.responseTime,
        tokenUsage: data.tokenUsage,
        cost: data.cost,
        userSatisfaction: null,
      });
    } catch (error) {
      console.error('Failed to log metrics:', error);
    }
  }

  private async logAnalyticsEvent(data: {
    userId: string;
    eventType: string;
    eventData: any;
  }) {
    try {
      await db.insert(analyticsEvents).values({
        userId: data.userId,
        eventType: data.eventType,
        eventData: data.eventData,
        sessionId: `session_${Date.now()}`,
      });
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  async getModelPerformanceMetrics(userId: string, days: number = 30): Promise<any> {
    try {
      const metrics = await db.select().from(modelMetrics)
        .where(and(
          eq(modelMetrics.userId, userId),
          // Add date filter for last N days
        ))
        .orderBy(desc(modelMetrics.date))
        .limit(1000);

      return this.aggregateMetrics(metrics);
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return {};
    }
  }

  private aggregateMetrics(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const totalTokens = metrics.reduce((sum, m) => sum + (m.tokenUsage || 0), 0);
    const avgResponseTime = metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0) / metrics.length;
    const totalCost = metrics.reduce((sum, m) => sum + parseFloat(m.cost || '0'), 0);

    return {
      totalRequests: metrics.length,
      totalTokens,
      averageResponseTime: Math.round(avgResponseTime),
      totalCost: totalCost.toFixed(6),
      modelDistribution: this.getModelDistribution(metrics)
    };
  }

  private getModelDistribution(metrics: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    metrics.forEach(metric => {
      const modelId = metric.modelId?.toString() || 'unknown';
      distribution[modelId] = (distribution[modelId] || 0) + 1;
    });
    return distribution;
  }
}

export const aiOrchestrator = new AIOrchestrator();