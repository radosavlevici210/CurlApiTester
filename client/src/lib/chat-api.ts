import { apiRequest } from "./queryClient";
import type { 
  ChatCompletionRequest, 
  Conversation, 
  Message, 
  InsertConversation,
  UpdateConversation 
} from "@shared/schema";

export const chatApi = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiRequest("GET", "/api/conversations");
    return response.json();
  },

  // Get specific conversation with messages
  getConversation: async (id: number): Promise<{ conversation: Conversation; messages: Message[] }> => {
    const response = await apiRequest("GET", `/api/conversations/${id}`);
    return response.json();
  },

  // Create new conversation
  createConversation: async (data: InsertConversation): Promise<Conversation> => {
    const response = await apiRequest("POST", "/api/conversations", data);
    return response.json();
  },

  // Update conversation
  updateConversation: async (id: number, updates: UpdateConversation): Promise<Conversation> => {
    const response = await apiRequest("PATCH", `/api/conversations/${id}`, updates);
    return response.json();
  },

  // Delete conversation
  deleteConversation: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/conversations/${id}`);
  },

  // Send message
  sendMessage: async (request: ChatCompletionRequest): Promise<{ content: string; conversationId: number; usage?: any }> => {
    const response = await apiRequest("POST", "/api/chat/completions", request);
    return response.json();
  },

  // Export conversation
  exportConversation: async (id: number): Promise<any> => {
    const response = await apiRequest("GET", `/api/conversations/${id}/export`);
    return response.json();
  },
};
