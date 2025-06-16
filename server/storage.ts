import { 
  users, 
  conversations, 
  messages,
  notifications,
  userDevices,
  organizations,
  type User, 
  type UpsertUser, 
  type Conversation,
  type InsertConversation,
  type UpdateConversation,
  type Message,
  type InsertMessage,
  type Notification,
  type UserDevice,
  type Organization
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: UpdateConversation): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;

  // Message operations
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessagesByConversation(conversationId: number): Promise<boolean>;

  // Device management
  registerDevice(userId: string, deviceInfo: { deviceId: string; deviceName: string; deviceType: string }): Promise<UserDevice>;
  getUserDevices(userId: string): Promise<UserDevice[]>;
  updateDeviceActivity(deviceId: string): Promise<void>;

  // Notifications
  createNotification(notification: { userId: string; type: string; title: string; message: string; data?: any }): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({
        ...insertConversation,
        organizationId: insertConversation.organizationId || null,
        userId: insertConversation.userId || null,
        systemPrompt: insertConversation.systemPrompt || null,
        githubRepoConnected: insertConversation.githubRepoConnected || null,
        githubBranch: insertConversation.githubBranch || null,
        isPrivate: insertConversation.isPrivate ?? true,
        isEncrypted: insertConversation.isEncrypted ?? false,
        visualizationEnabled: insertConversation.visualizationEnabled ?? false,
      })
      .returning();
    return conversation;
  }

  async updateConversation(id: number, updates: UpdateConversation): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async deleteConversation(id: number): Promise<boolean> {
    await this.deleteMessagesByConversation(id);
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return result.rowCount > 0;
  }

  // Message operations
  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        userId: insertMessage.userId || null,
        encryptedContent: insertMessage.encryptedContent || null,
        attachments: insertMessage.attachments || [],
        metadata: insertMessage.metadata || {},
      })
      .returning();
    return message;
  }

  async deleteMessagesByConversation(conversationId: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.conversationId, conversationId));
    return true;
  }

  // Device management
  async registerDevice(userId: string, deviceInfo: { deviceId: string; deviceName: string; deviceType: string }): Promise<UserDevice> {
    const [device] = await db
      .insert(userDevices)
      .values({
        userId,
        ...deviceInfo,
      })
      .onConflictDoUpdate({
        target: userDevices.deviceId,
        set: {
          lastActive: new Date(),
          isActive: true,
        },
      })
      .returning();
    return device;
  }

  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return await db
      .select()
      .from(userDevices)
      .where(and(eq(userDevices.userId, userId), eq(userDevices.isActive, true)))
      .orderBy(desc(userDevices.lastActive));
  }

  async updateDeviceActivity(deviceId: string): Promise<void> {
    await db
      .update(userDevices)
      .set({ lastActive: new Date() })
      .where(eq(userDevices.deviceId, deviceId));
  }

  // Notifications
  async createNotification(notification: { userId: string; type: string; title: string; message: string; data?: any }): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        data: notification.data || {},
      })
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    return await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
