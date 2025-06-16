import { useState, useEffect } from "react";
import type { Settings } from "@shared/schema";

const DEFAULT_SETTINGS: Settings = {
  baseUrl: "https://api.x.ai/v1",
  model: "grok-2-1212",
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: "You are a helpful assistant.",
  saveHistory: true,
  autoScroll: true,
  streamMode: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("grok-chat-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error("Failed to parse stored settings:", error);
      }
    }
  }, []);

  // Update settings and save to localStorage
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("grok-chat-settings", JSON.stringify(updated));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem("grok-chat-settings", JSON.stringify(DEFAULT_SETTINGS));
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
