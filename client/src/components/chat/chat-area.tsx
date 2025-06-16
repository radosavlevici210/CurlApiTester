import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Download, Trash2, Settings2 } from "lucide-react";
import Message from "./message";
import ChatInput from "./chat-input";
import { useChat } from "@/hooks/use-chat";
import type { Conversation, Message as MessageType, Settings } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  conversation?: Conversation;
  messages: MessageType[];
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenSystemPrompt: () => void;
  settings: Settings;
}

export default function ChatArea({
  conversation,
  messages,
  onToggleSidebar,
  onOpenSettings,
  onOpenSystemPrompt,
  settings,
}: ChatAreaProps) {
  const { 
    sendMessage, 
    isLoading, 
    clearConversation, 
    exportConversation,
    updateConversationSettings 
  } = useChat();
  
  const [model, setModel] = useState(conversation?.model || settings.model);

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    if (conversation) {
      updateConversationSettings(conversation.id, { model: newModel });
    }
  };

  const handleExport = async () => {
    if (conversation) {
      await exportConversation(conversation.id);
    }
  };

  const handleClear = () => {
    if (conversation && confirm("Are you sure you want to clear this conversation?")) {
      clearConversation(conversation.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {conversation?.title || "Grok Chat"}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Select value={model} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grok-2-1212">grok-2-1212</SelectItem>
                    <SelectItem value="grok-2-vision-1212">grok-2-vision-1212</SelectItem>
                    <SelectItem value="grok-beta">grok-beta</SelectItem>
                    <SelectItem value="grok-vision-beta">grok-vision-beta</SelectItem>
                  </SelectContent>
                </Select>
                <span>•</span>
                <span>Temperature: {settings.temperature}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              disabled={!conversation}
              title="Export Conversation"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={!conversation}
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <Message 
              key={message.id} 
              message={message}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    G
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-tl-md">
                    <div className="typing-indicator flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  G
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm">Ask me anything and I'll help you out!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        onOpenSystemPrompt={onOpenSystemPrompt}
        disabled={isLoading}
        settings={settings}
      />
    </div>
  );
}
