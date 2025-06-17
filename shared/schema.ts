import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users with enterprise features
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  licenseType: text("license_type").notNull().default("free"), // free, pro, enterprise
  githubConnected: boolean("github_connected").default(false),
  githubUsername: varchar("github_username"),
  githubAccessToken: text("github_access_token"),
  privacyMode: boolean("privacy_mode").default(true),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations for enterprise features
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  licenseKey: text("license_key").notNull().unique(),
  maxUsers: integer("max_users").default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

// Organization members
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Device management for multi-device access
export const userDevices = pgTable("user_devices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceId: text("device_id").notNull().unique(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(), // desktop, mobile, tablet
  lastActive: timestamp("last_active").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced conversations with privacy and enterprise features
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: varchar("user_id").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  systemPrompt: text("system_prompt").default("You are a helpful AI assistant."),
  model: text("model").notNull().default("grok-2-1212"),
  temperature: integer("temperature").default(70),
  maxTokens: integer("max_tokens").default(1000),
  isPrivate: boolean("is_private").default(true),
  isEncrypted: boolean("is_encrypted").default(false),
  githubRepoConnected: text("github_repo_connected"),
  githubBranch: text("github_branch").default("main"),
  visualizationEnabled: boolean("visualization_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced messages with encryption support
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: varchar("user_id").references(() => users.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  encryptedContent: text("encrypted_content"),
  attachments: jsonb("attachments").default([]),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time notifications for multi-device sync
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // message, device_login, conversation_shared
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default({}),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content generation templates for enterprise
export const contentTemplates = pgTable("content_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  prompt: text("prompt").notNull(),
  isPublic: boolean("is_public").default(false),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// GitHub integration tracking
export const githubIntegrations = pgTable("github_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  repoName: text("repo_name").notNull(),
  repoUrl: text("repo_url").notNull(),
  branch: text("branch").default("main"),
  conversationId: integer("conversation_id").references(() => conversations.id),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced AI Models and Configurations
export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  modelId: text("model_id").notNull(),
  maxTokens: integer("max_tokens").default(4096),
  temperature: text("temperature").default("0.7"),
  systemPrompt: text("system_prompt"),
  isActive: boolean("is_active").default(true),
  licenseRequired: text("license_required").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Collaboration Features
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  sessionName: text("session_name").notNull(),
  participants: text("participants").array(),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Analytics and Insights
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data"),
  sessionId: text("session_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// AI Model Performance Metrics
export const modelMetrics = pgTable("model_metrics", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => aiModels.id),
  userId: varchar("user_id").references(() => users.id),
  responseTime: integer("response_time"),
  tokenUsage: integer("token_usage"),
  cost: text("cost"),
  userSatisfaction: integer("user_satisfaction"),
  date: timestamp("date").defaultNow(),
});

// Business Templates for Enterprise
export const businessTemplates = pgTable("business_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  template: text("template").notNull(),
  variables: jsonb("variables"),
  licenseRequired: text("license_required").default("pro"),
  isPublic: boolean("is_public").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Security and Audit Logs
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  riskLevel: text("risk_level").default("low"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// API Usage Tracking
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"),
  tokensCost: integer("tokens_cost").default(0),
  date: timestamp("date").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  devices: many(userDevices),
  notifications: many(notifications),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  user: one(users, { fields: [messages.userId], references: [users.id] }),
}));

// Schema definitions
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertContentTemplateSchema = createInsertSchema(contentTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const updateConversationSchema = insertConversationSchema.partial();

// Type exports
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type UserDevice = typeof userDevices.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type GithubIntegration = typeof githubIntegrations.$inferSelect;

// Enhanced chat API with enterprise features
export const chatCompletionSchema = z.object({
  conversationId: z.number().optional(),
  message: z.string().min(1),
  model: z.string().default("grok-2-1212"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  systemPrompt: z.string().optional(),
  stream: z.boolean().default(true),
  isPrivate: z.boolean().default(true),
  enableVisualization: z.boolean().default(false),
  githubRepo: z.string().optional(),
  attachments: z.array(z.object({
    type: z.string(),
    data: z.string(),
    filename: z.string().optional(),
  })).optional(),
});

export type ChatCompletionRequest = z.infer<typeof chatCompletionSchema>;

// Enhanced settings with enterprise features
export const settingsSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().default("https://api.x.ai/v1"),
  model: z.string().default("grok-2-1212"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
  systemPrompt: z.string().default("You are a helpful AI assistant."),
  saveHistory: z.boolean().default(true),
  autoScroll: z.boolean().default(true),
  streamMode: z.boolean().default(true),
  privacyMode: z.boolean().default(true),
  enableNotifications: z.boolean().default(true),
  enableVisualization: z.boolean().default(false),
  enableGithubSync: z.boolean().default(false),
  licenseType: z.enum(["free", "pro", "enterprise"]).default("free"),
});

export type Settings = z.infer<typeof settingsSchema>;

// License management schemas
export const licenseSchema = z.object({
  type: z.enum(["free", "pro", "enterprise"]),
  features: z.array(z.string()),
  maxConversations: z.number(),
  maxUsers: z.number().optional(),
  maxDevices: z.number(),
  enableGithubIntegration: z.boolean(),
  enableVisualization: z.boolean(),
  enableEncryption: z.boolean(),
  supportLevel: z.enum(["community", "standard", "priority"]),
});

export type License = z.infer<typeof licenseSchema>;

// Copyright and enterprise licensing
export const ENTERPRISE_LICENSE = {
  name: "Grok Enterprise Chat Platform",
  version: "2.0.0",
  copyright: "© 2025 ervin210@icloud.com. All rights reserved.",
  license: "Enterprise License",
  features: [
    "Multi-device synchronization",
    "End-to-end encryption", 
    "GitHub repository integration",
    "Advanced visualization tools",
    "Organization management",
    "Priority support",
    "Custom content templates",
    "API access",
    "White-label deployment"
  ],
  restrictions: [
    "Commercial use requires valid enterprise license",
    "Redistribution prohibited without written consent",
    "Reverse engineering prohibited",
    "Source code access restricted to licensed users"
  ]
} as const;
