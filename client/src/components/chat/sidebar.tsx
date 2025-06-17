import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Settings, Moon, Sun, Bot, MoreHorizontal, Activity, Sparkles, Github, Brain } from "lucide-react";
import type { Conversation } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  currentConversation?: Conversation;
  onNewChat: () => void;
  onOpenSettings: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({
  isOpen,
  conversations,
  currentConversation,
  onNewChat,
  onOpenSettings,
  darkMode,
  onToggleDarkMode,
}: SidebarProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className={cn(
      "w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out",
      !isOpen && "md:-translate-x-full"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Bot className="text-primary mr-2 h-5 w-5" />
            X.AI Grok Chat
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="h-8 w-8"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Recent Conversations
          </h3>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link
                href={`/chat/${conversation.id}`}
                key={conversation.id}
              >
                <div className={cn(
                  "conversation-item p-3 rounded-lg cursor-pointer transition-colors group",
                  currentConversation?.id === conversation.id && "active"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conversation.model} • {(conversation.temperature || 70) / 100} temp
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(conversation.updatedAt || conversation.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
            {conversations.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No conversations yet. Start a new chat!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Navigation & Features */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link href="/monitoring">
          <Button variant="ghost" className="w-full justify-start">
            <Activity className="mr-3 h-4 w-4" />
            Monitoring
          </Button>
        </Link>
        <Link href="/ai-playground">
          <Button variant="ghost" className="w-full justify-start">
            <Sparkles className="mr-3 h-4 w-4" />
            AI Playground
          </Button>
        </Link>
        <Link href="/github">
          <Button variant="ghost" className="w-full justify-start">
            <Github className="mr-3 h-4 w-4" />
            GitHub Integration
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={onOpenSettings}
          className="w-full justify-start"
        >
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Copyright Notice */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">
        © {new Date().getFullYear()} Ervin Remus Radosavlevici. All rights reserved.
      </div>
    </div>
  );
}