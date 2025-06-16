import { useState, useEffect } from "react";
import { useParams } from "wouter";
import Sidebar from "@/components/chat/sidebar";
import ChatArea from "@/components/chat/chat-area";
import SettingsModal from "@/components/chat/settings-modal";
import SystemPromptModal from "@/components/chat/system-prompt-modal";
import { useSettings } from "@/hooks/use-settings";
import { useChat } from "@/hooks/use-chat";

export default function ChatPage() {
  const { id } = useParams<{ id?: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [systemPromptOpen, setSystemPromptOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const { settings } = useSettings();
  const { 
    currentConversation, 
    messages, 
    conversations,
    loadConversation,
    createNewChat
  } = useChat();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('darkMode') === 'true';
    setDarkMode(stored);
    if (stored) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Load conversation if ID provided
  useEffect(() => {
    if (id) {
      loadConversation(parseInt(id));
    }
  }, [id, loadConversation]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentConversation={currentConversation}
        onNewChat={createNewChat}
        onOpenSettings={() => setSettingsOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <ChatArea
        conversation={currentConversation}
        messages={messages}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSystemPrompt={() => setSystemPromptOpen(true)}
        settings={settings}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <SystemPromptModal
        isOpen={systemPromptOpen}
        onClose={() => setSystemPromptOpen(false)}
      />
    </div>
  );
}
