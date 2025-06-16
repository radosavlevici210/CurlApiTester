import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = {
  default: "You are a helpful assistant.",
  coding: "You are a coding assistant. Help users write, debug, and explain code. Provide clear explanations and best practices.",
  creative: "You are a creative writing assistant. Help users with storytelling, poetry, and creative content. Be imaginative and inspiring.",
};

export default function SystemPromptModal({ isOpen, onClose }: SystemPromptModalProps) {
  const { settings, updateSettings } = useSettings();
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);

  const handleSave = () => {
    updateSettings({ ...settings, systemPrompt });
    onClose();
  };

  const handleReset = () => {
    setSystemPrompt(PRESETS.default);
  };

  const handlePreset = (preset: keyof typeof PRESETS) => {
    setSystemPrompt(PRESETS[preset]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>System Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="systemPrompt">Custom System Prompt</Label>
            <Textarea
              id="systemPrompt"
              placeholder="You are a helpful assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={8}
              className="mt-2 resize-none"
            />
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Presets:</span>
            <Button
              variant="link"
              onClick={() => handlePreset("default")}
              className="h-auto p-0 text-primary hover:text-primary/80"
            >
              Default
            </Button>
            <Button
              variant="link"
              onClick={() => handlePreset("coding")}
              className="h-auto p-0 text-primary hover:text-primary/80"
            >
              Coding Assistant
            </Button>
            <Button
              variant="link"
              onClick={() => handlePreset("creative")}
              className="h-auto p-0 text-primary hover:text-primary/80"
            >
              Creative Writer
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
