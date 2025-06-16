import { format } from "date-fns";
import type { Message as MessageType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const timestamp = message.createdAt ? format(new Date(message.createdAt), "h:mm a") : "";

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-3xl">
          <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-br-md">
            <div className="message-content whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
            {timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-3xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            G
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-tl-md">
            <div 
              className="message-content prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-11 mt-1">
          {timestamp}
        </div>
      </div>
    </div>
  );
}
