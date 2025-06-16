
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Share2, Save, Download, Eye } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CollaborativeDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  collaborators: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    isOnline: boolean;
  }>;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
  };
}

interface CollaborativeSuggestion {
  suggestions: string[];
  improvements: string[];
  questions: string[];
}

export default function RealTimeEditor() {
  const [document, setDocument] = useState<CollaborativeDocument | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState("editor");
  const [suggestions, setSuggestions] = useState<CollaborativeSuggestion | null>(null);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket for real-time collaboration
  useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'document_update') {
        setContent(data.content);
      } else if (data.type === 'collaborator_joined') {
        toast({
          title: "Collaborator Joined",
          description: `${data.user.name} joined the document`,
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [toast]);

  const suggestionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/collaboration/suggest", {
        method: "POST",
        body: JSON.stringify({
          content,
          userRole,
          context: { documentType: "collaborative", language: "markdown" }
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast({
        title: "AI Suggestions Ready",
        description: "Smart suggestions generated for your content",
      });
    },
  });

  const saveDocument = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/documents/save", {
        method: "POST",
        body: JSON.stringify({ content, title: document?.title || "Untitled" }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Document Saved",
        description: "Your changes have been saved successfully",
      });
    },
  });

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Send real-time updates via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'document_update',
        content: newContent,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const exportDocument = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document?.title || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collaborative Editor</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time document collaboration with AI-powered suggestions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Users className="h-3 w-3 mr-1" />
            {document?.collaborators.filter(c => c.isOnline).length || 0} Online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Editor</CardTitle>
                  <CardDescription>Collaborative markdown editor with real-time sync</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => suggestionMutation.mutate()}
                    disabled={suggestionMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Get AI Suggestions
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveDocument.mutate()}
                    disabled={saveDocument.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportDocument}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Start typing your document here..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[500px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document?.collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {collaborator.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{collaborator.name}</p>
                    <p className="text-xs text-gray-500">{collaborator.role}</p>
                  </div>
                </div>
              ))}
              
              <Button size="sm" variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-1" />
                Invite Collaborators
              </Button>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {suggestions && (
            <Card>
              <CardHeader>
                <CardTitle>AI Suggestions</CardTitle>
                <CardDescription>Smart recommendations for your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Improvements</h4>
                    <div className="space-y-2">
                      {suggestions.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {suggestions.questions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Questions to Consider</h4>
                    <div className="space-y-2">
                      {suggestions.questions.map((question, index) => (
                        <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                          {question}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
