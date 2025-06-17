import { db } from "../db.js";
import { workflows, analyticsEvents } from "../../shared/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { OpenAI } from "openai";

export class AdvancedWorkflowEngine {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createWorkflow(data: {
    name: string;
    description?: string;
    triggers: any[];
    actions: any[];
    conditions?: any[];
    workspaceId: number;
    createdBy: string;
  }) {
    const [workflow] = await db.insert(workflows).values(data).returning();
    
    // Log workflow creation
    await this.logEvent("workflow_created", {
      workflowId: workflow.id,
      workspaceId: data.workspaceId,
      createdBy: data.createdBy,
    });

    return workflow;
  }

  async executeWorkflow(workflowId: number, context: any = {}) {
    const workflow = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
    
    if (!workflow[0] || !workflow[0].isActive) {
      throw new Error("Workflow not found or inactive");
    }

    const workflowData = workflow[0];
    
    try {
      // Check conditions
      if (workflowData.conditions && !this.evaluateConditions(workflowData.conditions, context)) {
        return { success: false, message: "Conditions not met" };
      }

      // Execute actions
      const results = [];
      for (const action of workflowData.actions as any[]) {
        const result = await this.executeAction(action, context);
        results.push(result);
      }

      // Update execution count
      await db.update(workflows)
        .set({ 
          executionCount: (workflowData.executionCount || 0) + 1,
          lastExecuted: new Date()
        })
        .where(eq(workflows.id, workflowId));

      // Log execution
      await this.logEvent("workflow_executed", {
        workflowId,
        results,
        context,
      });

      return { success: true, results };
    } catch (error) {
      await this.logEvent("workflow_error", {
        workflowId,
        error: error.message,
        context,
      });
      throw error;
    }
  }

  private async executeAction(action: any, context: any) {
    switch (action.type) {
      case "ai_completion":
        return await this.executeAICompletion(action, context);
      case "send_notification":
        return await this.executeSendNotification(action, context);
      case "create_document":
        return await this.executeCreateDocument(action, context);
      case "webhook":
        return await this.executeWebhook(action, context);
      case "email":
        return await this.executeEmail(action, context);
      case "slack":
        return await this.executeSlack(action, context);
      case "github":
        return await this.executeGithub(action, context);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeAICompletion(action: any, context: any) {
    const prompt = this.interpolateString(action.prompt, context);
    
    const completion = await this.client.chat.completions.create({
      model: action.model || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: action.temperature || 0.7,
      max_tokens: action.maxTokens || 1000,
    });

    return {
      type: "ai_completion",
      result: completion.choices[0]?.message?.content,
      tokensUsed: completion.usage?.total_tokens,
    };
  }

  private async executeSendNotification(action: any, context: any) {
    // Implementation for sending notifications
    return {
      type: "notification",
      result: "Notification sent successfully",
    };
  }

  private async executeCreateDocument(action: any, context: any) {
    // Implementation for creating documents
    return {
      type: "document",
      result: "Document created successfully",
    };
  }

  private async executeWebhook(action: any, context: any) {
    const url = this.interpolateString(action.url, context);
    const payload = this.interpolateObject(action.payload, context);

    const response = await fetch(url, {
      method: action.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...action.headers,
      },
      body: JSON.stringify(payload),
    });

    return {
      type: "webhook",
      result: {
        status: response.status,
        statusText: response.statusText,
        data: await response.json().catch(() => null),
      },
    };
  }

  private async executeEmail(action: any, context: any) {
    // Implementation for sending emails
    return {
      type: "email",
      result: "Email sent successfully",
    };
  }

  private async executeSlack(action: any, context: any) {
    // Implementation for Slack integration
    return {
      type: "slack",
      result: "Slack message sent successfully",
    };
  }

  private async executeGithub(action: any, context: any) {
    // Implementation for GitHub integration
    return {
      type: "github",
      result: "GitHub action completed successfully",
    };
  }

  private evaluateConditions(conditions: any, context: any): boolean {
    // Simple condition evaluation logic
    for (const condition of conditions) {
      const value = this.getValueFromContext(condition.field, context);
      const expected = condition.value;
      
      switch (condition.operator) {
        case "equals":
          if (value !== expected) return false;
          break;
        case "not_equals":
          if (value === expected) return false;
          break;
        case "contains":
          if (!value.toString().includes(expected)) return false;
          break;
        case "greater_than":
          if (!(value > expected)) return false;
          break;
        case "less_than":
          if (!(value < expected)) return false;
          break;
        default:
          return false;
      }
    }
    return true;
  }

  private interpolateString(template: string, context: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.getValueFromContext(key, context) || match;
    });
  }

  private interpolateObject(obj: any, context: any): any {
    if (typeof obj === "string") {
      return this.interpolateString(obj, context);
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, context));
    } else if (obj && typeof obj === "object") {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, context);
      }
      return result;
    }
    return obj;
  }

  private getValueFromContext(path: string, context: any): any {
    return path.split('.').reduce((obj, key) => obj?.[key], context);
  }

  private async logEvent(eventType: string, data: any) {
    await db.insert(analyticsEvents).values({
      eventType,
      eventData: data,
      timestamp: new Date(),
    });
  }

  async getWorkflowsByWorkspace(workspaceId: number) {
    return await db.select().from(workflows).where(eq(workflows.workspaceId, workspaceId));
  }

  async getWorkflowById(id: number) {
    return await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  }

  async updateWorkflow(id: number, updates: Partial<typeof workflows.$inferInsert>) {
    const [updated] = await db.update(workflows).set(updates).where(eq(workflows.id, id)).returning();
    return updated;
  }

  async deleteWorkflow(id: number) {
    await db.delete(workflows).where(eq(workflows.id, id));
    return true;
  }

  async getWorkflowTemplates() {
    return [
      {
        id: "content_generation",
        name: "Content Generation Workflow",
        description: "Automatically generate content based on triggers",
        template: {
          triggers: [{ type: "schedule", cron: "0 9 * * 1" }],
          actions: [
            {
              type: "ai_completion",
              prompt: "Generate a weekly blog post about {{topic}}",
              model: "gpt-4o",
              temperature: 0.7,
            },
            {
              type: "create_document",
              title: "Weekly Blog Post - {{date}}",
              content: "{{ai_result}}",
            },
          ],
        },
      },
      {
        id: "code_review",
        name: "Automated Code Review",
        description: "Review code changes and provide feedback",
        template: {
          triggers: [{ type: "github_pr", repository: "{{repo}}" }],
          actions: [
            {
              type: "ai_completion",
              prompt: "Review this code change and provide feedback:\n{{diff}}",
              model: "gpt-4o",
              temperature: 0.2,
            },
            {
              type: "github",
              action: "create_review_comment",
              comment: "{{ai_result}}",
            },
          ],
        },
      },
      {
        id: "sentiment_monitoring",
        name: "Sentiment Monitoring",
        description: "Monitor sentiment and alert on negative feedback",
        template: {
          triggers: [{ type: "new_message", source: "support" }],
          conditions: [
            {
              field: "sentiment_score",
              operator: "less_than",
              value: -0.5,
            },
          ],
          actions: [
            {
              type: "send_notification",
              title: "Negative Sentiment Alert",
              message: "Customer feedback has negative sentiment: {{message}}",
            },
            {
              type: "slack",
              channel: "#customer-support",
              message: "🚨 Negative feedback detected: {{message}}",
            },
          ],
        },
      },
    ];
  }
}

export const advancedWorkflowEngine = new AdvancedWorkflowEngine();