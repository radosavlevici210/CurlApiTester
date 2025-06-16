import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setLocalSettings(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Configuration */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              API Configuration
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="xai-xxxxxxxxxxxxxxxxxxxx"
                    value={localSettings.apiKey || ""}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, apiKey: e.target.value })
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-0 top-0 h-full w-10"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={localSettings.baseUrl}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, baseUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Model Parameters */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Model Parameters
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Select
                  value={localSettings.model}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, model: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grok-2-1212">grok-2-1212</SelectItem>
                    <SelectItem value="grok-2-vision-1212">grok-2-vision-1212</SelectItem>
                    <SelectItem value="grok-beta">grok-beta</SelectItem>
                    <SelectItem value="grok-vision-beta">grok-vision-beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature: {localSettings.temperature}</Label>
                <Slider
                  value={[localSettings.temperature]}
                  onValueChange={([value]) =>
                    setLocalSettings({ ...localSettings, temperature: value })
                  }
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Max Tokens: {localSettings.maxTokens}</Label>
                <Slider
                  value={[localSettings.maxTokens]}
                  onValueChange={([value]) =>
                    setLocalSettings({ ...localSettings, maxTokens: value })
                  }
                  min={100}
                  max={4000}
                  step={100}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Advanced
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveHistory"
                  checked={localSettings.saveHistory}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, saveHistory: checked as boolean })
                  }
                />
                <Label htmlFor="saveHistory">Save conversation history</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoScroll"
                  checked={localSettings.autoScroll}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, autoScroll: checked as boolean })
                  }
                />
                <Label htmlFor="autoScroll">Auto-scroll to new messages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="streamMode"
                  checked={localSettings.streamMode}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, streamMode: checked as boolean })
                  }
                />
                <Label htmlFor="streamMode">Enable streaming by default</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
