import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { chatApi } from "@/lib/chat-api";
import type { Conversation, Message, UpdateConversation } from "@shared/schema";
import { useSettings } from "./use-settings";

export function useChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  
  const [currentConversation, setCurrentConversation] = useState<Conversation | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch messages for current conversation
  const { data: messagesData } = useQuery({
    queryKey: ["/api/conversations", currentConversation?.id],
    enabled: !!currentConversation?.id,
  });

  const messages: Message[] = messagesData?.messages || [];

  // Load specific conversation
  const loadConversation = useCallback(async (id: number) => {
    try {
      const data = await chatApi.getConversation(id);
      setCurrentConversation(data.conversation);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Create new conversation
  const createNewChat = useCallback(() => {
    setCurrentConversation(undefined);
    setLocation("/");
  }, [setLocation]);

  // Send message
  const sendMessage = useCallback(async (message: string, stream = true) => {
    setIsLoading(true);
    
    try {
      if (stream) {
        // Handle streaming
        const response = await fetch("/api/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: currentConversation?.id,
            message,
            model: settings.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            systemPrompt: settings.systemPrompt,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        let conversationId = currentConversation?.id;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                // Refresh conversations and messages
                queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
                if (conversationId) {
                  queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
                  if (!currentConversation) {
                    const conv = await chatApi.getConversation(conversationId);
                    setCurrentConversation(conv.conversation);
                    setLocation(`/chat/${conversationId}`);
                  }
                }
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.conversationId && !conversationId) {
                  conversationId = parsed.conversationId;
                }
              } catch (e) {
                // Ignore parsing errors for streaming chunks
              }
            }
          }
        }
      } else {
        // Handle non-streaming
        const response = await chatApi.sendMessage({
          conversationId: currentConversation?.id,
          message,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt,
          stream: false,
        });

        if (!currentConversation && response.conversationId) {
          const conv = await chatApi.getConversation(response.conversationId);
          setCurrentConversation(conv.conversation);
          setLocation(`/chat/${response.conversationId}`);
        }

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
        if (response.conversationId) {
          queryClient.invalidateQueries({ queryKey: ["/api/conversations", response.conversationId] });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, settings, toast, queryClient, setLocation]);

  // Update conversation settings
  const updateConversationSettings = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateConversation }) =>
      chatApi.updateConversation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (currentConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", currentConversation.id] });
      }
    },
  });

  // Clear conversation
  const clearConversation = useCallback(async (id: number) => {
    try {
      await chatApi.deleteConversation(id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (currentConversation?.id === id) {
        setCurrentConversation(undefined);
        setLocation("/");
      }
      toast({
        title: "Success",
        description: "Conversation cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear conversation",
        variant: "destructive",
      });
    }
  }, [currentConversation, queryClient, setLocation, toast]);

  // Export conversation
  const exportConversation = useCallback(async (id: number) => {
    try {
      const data = await chatApi.exportConversation(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grok-chat-${id}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Conversation exported",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export conversation",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    currentConversation,
    messages,
    conversations,
    isLoading,
    sendMessage,
    loadConversation,
    createNewChat,
    updateConversationSettings: updateConversationSettings.mutate,
    clearConversation,
    exportConversation,
  };
}
