import { db } from "../db.js";
import { workspaces, documents, knowledgeBase, workflows, aiAgents, collaborationRooms } from "../../shared/schema.js";
import { eq, and, desc } from "drizzle-orm";

export class WorkspaceManager {
  async createWorkspace(data: {
    name: string;
    description?: string;
    organizationId?: number;
    ownerId: string;
    settings?: any;
  }) {
    const [workspace] = await db.insert(workspaces).values(data).returning();
    
    // Create default AI agents for the workspace
    await this.createDefaultAgents(workspace.id, data.ownerId);
    
    return workspace;
  }

  async getWorkspacesByUser(userId: string) {
    return await db.select().from(workspaces).where(eq(workspaces.ownerId, userId));
  }

  async getWorkspaceById(id: number) {
    return await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  }

  async updateWorkspace(id: number, updates: Partial<typeof workspaces.$inferInsert>) {
    const [updated] = await db.update(workspaces).set(updates).where(eq(workspaces.id, id)).returning();
    return updated;
  }

  async deleteWorkspace(id: number) {
    // Cascade delete related data
    await db.delete(documents).where(eq(documents.workspaceId, id));
    await db.delete(knowledgeBase).where(eq(knowledgeBase.workspaceId, id));
    await db.delete(workflows).where(eq(workflows.workspaceId, id));
    await db.delete(aiAgents).where(eq(aiAgents.workspaceId, id));
    await db.delete(collaborationRooms).where(eq(collaborationRooms.workspaceId, id));
    
    await db.delete(workspaces).where(eq(workspaces.id, id));
    return true;
  }

  async getWorkspaceAnalytics(workspaceId: number) {
    const [documentsResult] = await db.select().from(documents).where(eq(documents.workspaceId, workspaceId));
    const [knowledgeResult] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.workspaceId, workspaceId));
    const [workflowsResult] = await db.select().from(workflows).where(eq(workflows.workspaceId, workspaceId));
    const [agentsResult] = await db.select().from(aiAgents).where(eq(aiAgents.workspaceId, workspaceId));

    return {
      documents: documentsResult ? 1 : 0,
      knowledgeBase: knowledgeResult ? 1 : 0,
      workflows: workflowsResult ? 1 : 0,
      aiAgents: agentsResult ? 1 : 0,
    };
  }

  private async createDefaultAgents(workspaceId: number, ownerId: string) {
    const defaultAgents = [
      {
        name: "Code Assistant",
        description: "AI assistant specialized in code analysis and generation",
        systemPrompt: "You are a senior software engineer AI assistant. Help with code review, debugging, and optimization.",
        capabilities: ["code-analysis", "debugging", "optimization", "documentation"],
        modelConfig: { model: "gpt-4o", temperature: 0.1 },
        workspaceId,
        createdBy: ownerId,
      },
      {
        name: "Content Writer",
        description: "AI assistant for content creation and editing",
        systemPrompt: "You are a professional content writer. Create engaging, well-structured content for various purposes.",
        capabilities: ["writing", "editing", "SEO", "marketing"],
        modelConfig: { model: "gpt-4o", temperature: 0.7 },
        workspaceId,
        createdBy: ownerId,
      },
      {
        name: "Business Analyst",
        description: "AI assistant for business analysis and strategy",
        systemPrompt: "You are a business analyst AI. Provide insights on market trends, business strategy, and data analysis.",
        capabilities: ["analysis", "strategy", "reporting", "forecasting"],
        modelConfig: { model: "gpt-4o", temperature: 0.3 },
        workspaceId,
        createdBy: ownerId,
      },
    ];

    await db.insert(aiAgents).values(defaultAgents);
  }
}

export const workspaceManager = new WorkspaceManager();