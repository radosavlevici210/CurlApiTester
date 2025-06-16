import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").references(() => users.id),
  systemPrompt: text("system_prompt").default("You are a helpful assistant."),
  model: text("model").notNull().default("grok-2-1212"),
  temperature: integer("temperature").default(70), // stored as integer (0.7 * 100)
  maxTokens: integer("max_tokens").default(1000),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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

export const updateConversationSchema = insertConversationSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;

// Chat API types
export const chatCompletionSchema = z.object({
  conversationId: z.number().optional(),
  message: z.string().min(1),
  model: z.string().default("grok-2-1212"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  systemPrompt: z.string().optional(),
  stream: z.boolean().default(true),
});

export type ChatCompletionRequest = z.infer<typeof chatCompletionSchema>;

export const settingsSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().default("https://api.x.ai/v1"),
  model: z.string().default("grok-2-1212"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
  systemPrompt: z.string().default("You are a helpful assistant."),
  saveHistory: z.boolean().default(true),
  autoScroll: z.boolean().default(true),
  streamMode: z.boolean().default(true),
});

export type Settings = z.infer<typeof settingsSchema>;
