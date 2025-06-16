import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, Paperclip, Settings2 } from "lucide-react";
import type { Settings } from "@shared/schema";

interface ChatInputProps {
  onSendMessage: (message: string, stream?: boolean) => void;
  onOpenSystemPrompt: () => void;
  disabled?: boolean;
  settings: Settings;
}

export default function ChatInput({
  onSendMessage,
  onOpenSystemPrompt,
  disabled = false,
  settings,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [streamMode, setStreamMode] = useState(settings.streamMode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setStreamMode(settings.streamMode);
  }, [settings.streamMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), streamMode);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
  };

  const charCount = message.length;
  const maxChars = 4000;

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message here..."
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className="w-full min-h-[48px] max-h-32 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-primary focus:border-primary resize-none"
                style={{ height: "auto" }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 bottom-3 h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-2xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="streamMode"
                checked={streamMode}
                onCheckedChange={(checked) => setStreamMode(checked as boolean)}
              />
              <Label htmlFor="streamMode" className="cursor-pointer">
                Stream responses
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenSystemPrompt}
              className="h-auto p-0 text-xs hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Settings2 className="mr-1 h-3 w-3" />
              System Prompt
            </Button>
          </div>
          <div className={`text-right ${charCount > maxChars * 0.9 ? "text-red-500" : ""}`}>
            {charCount} / {maxChars}
          </div>
        </div>
      </div>
    </div>
  );
}
