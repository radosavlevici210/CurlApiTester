
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Share2, 
  Download, 
  History, 
  Users, 
  Eye,
  Edit3,
  FileText,
  GitBranch,
  Clock,
  BarChart3,
  Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: number;
  title: string;
  content: string;
  version: string;
  workspaceId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    tags: string[];
    isPrivate: boolean;
    templateId?: string;
  };
}

interface DocumentVersion {
  id: number;
  version: string;
  content: string;
  changes: any[];
  createdBy: string;
  changesSummary: string;
  createdAt: string;
}

interface DocumentCollaborator {
  userId: string;
  permission: 'read' | 'write' | 'admin' | 'comment';
  grantedBy: string;
  grantedAt: string;
}

interface DocumentProps {
  documentId: number;
  workspaceId: number;
}

export default function DocumentEditor({ documentId, workspaceId }: DocumentProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [shareUserId, setShareUserId] = useState("");
  const [sharePermission, setSharePermission] = useState<'read' | 'write' | 'comment'>('read');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Fetch document
  const { data: document, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => apiRequest(`/api/documents/${documentId}`),
    enabled: !!documentId,
  });

  // Fetch versions
  const { data: versions } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: () => apiRequest(`/api/documents/${documentId}/versions`),
    enabled: !!documentId,
  });

  // Fetch collaborators
  const { data: collaborators } = useQuery({
    queryKey: ['document-collaborators', documentId],
    queryFn: () => apiRequest(`/api/documents/${documentId}/collaborators`),
    enabled: !!documentId,
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['document-analytics', documentId],
    queryFn: () => apiRequest(`/api/documents/${documentId}/analytics`),
    enabled: !!documentId,
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Document>) =>
      apiRequest(`/api/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      toast({
        title: "Document Saved",
        description: "Your changes have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save document changes",
        variant: "destructive",
      });
    },
  });

  // Share document mutation
  const shareMutation = useMutation({
    mutationFn: ({ targetUserId, permission }: { targetUserId: string; permission: string }) =>
      apiRequest(`/api/documents/${documentId}/share`, {
        method: 'POST',
        body: JSON.stringify({ targetUserId, permission }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-collaborators', documentId] });
      toast({
        title: "Document Shared",
        description: "Document has been shared successfully",
      });
      setShareUserId("");
    },
  });

  // Restore version mutation
  const restoreMutation = useMutation({
    mutationFn: (versionId: number) =>
      apiRequest(`/api/documents/${documentId}/versions/${versionId}/restore`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      toast({
        title: "Version Restored",
        description: "Document has been restored to the selected version",
      });
    },
  });

  // Initialize document data
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContent(document.content || "");
      setTags(document.metadata?.tags || []);
    }
  }, [document]);

  // Auto-save functionality
  useEffect(() => {
    if (isEditing && document) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        updateMutation.mutate({ title, content, metadata: { ...document.metadata, tags } });
      }, 2000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [title, content, tags, isEditing]);

  const handleSave = () => {
    updateMutation.mutate({ title, content, metadata: { ...document?.metadata, tags } });
  };

  const handleShare = () => {
    if (shareUserId && sharePermission) {
      shareMutation.mutate({ targetUserId: shareUserId, permission: sharePermission });
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/export/${format}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'document'}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: `Document exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export document",
        variant: "destructive",
      });
    }
  };

  const handleRestoreVersion = (versionId: number) => {
    restoreMutation.mutate(versionId);
  };

  if (isLoading) {
    return <div>Loading document...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsEditing(true);
            }}
            placeholder="Document title..."
            className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
          />
          <Badge variant="outline">v{document?.version}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              <div className="p-3 space-y-3">
                <Input
                  placeholder="User ID or email"
                  value={shareUserId}
                  onChange={(e) => setShareUserId(e.target.value)}
                />
                <Select value={sharePermission} onValueChange={(value: any) => setSharePermission(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="write">Edit</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleShare} className="w-full" disabled={!shareUserId}>
                  Share Document
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('markdown')}>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('html')}>
                Export as HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">
            <Edit3 className="h-4 w-4 mr-1" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="versions">
            <History className="h-4 w-4 mr-1" />
            Versions ({versions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="collaborators">
            <Users className="h-4 w-4 mr-1" />
            Collaborators ({collaborators?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor">
          <Card>
            <CardContent className="p-6">
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Start writing your document..."
                className="min-h-[600px] resize-none border-none focus-visible:ring-0 p-0"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Document Versions</CardTitle>
              <CardDescription>
                View and restore previous versions of this document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {versions?.map((version: DocumentVersion) => (
                <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">v{version.version}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{version.changesSummary}</p>
                    <p className="text-xs text-gray-500">
                      {version.changes.length} changes by {version.createdBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreVersion(version.id)}
                    >
                      <GitBranch className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators">
          <Card>
            <CardHeader>
              <CardTitle>Document Collaborators</CardTitle>
              <CardDescription>
                Manage who has access to this document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {collaborators?.map((collaborator: DocumentCollaborator) => (
                <div key={collaborator.userId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{collaborator.userId.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{collaborator.userId}</p>
                      <p className="text-sm text-gray-500">
                        Added {new Date(collaborator.grantedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    collaborator.permission === 'admin' ? 'default' :
                    collaborator.permission === 'write' ? 'secondary' : 'outline'
                  }>
                    {collaborator.permission}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Versions:</span>
                  <span className="font-medium">{analytics?.totalVersions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Collaborators:</span>
                  <span className="font-medium">{analytics?.totalCollaborators || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Modified:</span>
                  <span className="font-medium">
                    {analytics?.lastModified ? new Date(analytics.lastModified).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Versions (30 days):</span>
                  <span className="font-medium">{analytics?.activitySummary?.versionsLast30Days || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collaboration Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Contributors:</span>
                  <span className="font-medium">{analytics?.collaborationMetrics?.totalContributors || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Active:</span>
                  <span className="font-medium">
                    {analytics?.collaborationMetrics?.mostActiveContributor || 'None'}
                  </span>
                </div>
                {analytics?.collaborationMetrics?.permissionBreakdown && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Permission Breakdown:</p>
                    {Object.entries(analytics.collaborationMetrics.permissionBreakdown).map(([permission, count]) => (
                      <div key={permission} className="flex justify-between text-sm">
                        <span>{permission}:</span>
                        <span>{count as number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
