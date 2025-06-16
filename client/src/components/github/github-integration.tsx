import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Github, Star, GitFork, Code, FileText, Shield, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  url: string;
}

interface CodeAnalysisResult {
  files: string[];
  languages: { [key: string]: number };
  complexity: number;
  suggestions: string[];
  securityIssues: string[];
  documentation: string;
}

export default function GitHubIntegration() {
  const [accessToken, setAccessToken] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const { data: repositories, refetch: refetchRepos } = useQuery<GitHubRepository[]>({
    queryKey: ["/api/github/repositories"],
    enabled: false,
  });

  const connectMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest("/api/github/connect", {
        method: "POST",
        body: JSON.stringify({ accessToken: token }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsConnected(true);
        toast({
          title: "GitHub Connected",
          description: "Successfully connected to your GitHub account",
        });
        refetchRepos();
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to GitHub. Please check your token.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while connecting to GitHub",
        variant: "destructive",
      });
    },
  });

  const analyzeRepoMutation = useMutation({
    mutationFn: async ({ owner, repo }: { owner: string; repo: string }) => {
      return await apiRequest("/api/github/analyze-repo", {
        method: "POST",
        body: JSON.stringify({ accessToken, owner, repo }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Repository analysis completed successfully",
      });
    },
  });

  const handleConnect = () => {
    if (!accessToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your GitHub access token",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate(accessToken);
  };

  const handleAnalyzeRepo = (repo: GitHubRepository) => {
    const [owner, repoName] = repo.fullName.split('/');
    analyzeRepoMutation.mutate({ owner, repo: repoName });
    setSelectedRepo(repo);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GitHub Integration</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect your repositories for enhanced AI-powered development workflow
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <Github className="h-3 w-3 mr-1" />
          Enterprise
        </Badge>
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Connect GitHub Account
            </CardTitle>
            <CardDescription>
              Enter your GitHub personal access token to connect your repositories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">GitHub Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Create a token at GitHub Settings → Developer settings → Personal access tokens
              </p>
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={connectMutation.isPending}
              className="w-full"
            >
              {connectMutation.isPending ? "Connecting..." : "Connect GitHub"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="repositories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="analysis">Code Analysis</TabsTrigger>
            <TabsTrigger value="integration">AI Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="repositories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories?.map((repo) => (
                <Card key={repo.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{repo.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {repo.description || "No description available"}
                        </CardDescription>
                      </div>
                      {repo.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getLanguageColor(repo.language) }}
                          />
                          {repo.language}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {repo.forks}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyzeRepo(repo)}
                        disabled={analyzeRepoMutation.isPending}
                        className="flex-1"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(repo.url, '_blank')}
                        className="flex-1"
                      >
                        <Github className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!repositories || repositories.length === 0) && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Github className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Repositories Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Your GitHub repositories will appear here once connected. Make sure your 
                    access token has the necessary permissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {selectedRepo ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Code Analysis: {selectedRepo.name}
                    </CardTitle>
                    <CardDescription>
                      AI-powered analysis of your repository structure and code quality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyzeRepoMutation.data ? (
                      <RepositoryAnalysisResults data={analyzeRepoMutation.data} />
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            Click "Analyze" on a repository to see detailed insights
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Repository
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Choose a repository from the Repositories tab to view its analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Smart Commit Messages
                  </CardTitle>
                  <CardDescription>
                    AI-generated commit messages based on code changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-mono">
                        feat(auth): implement OAuth2 integration with enhanced security
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Generated from: 15 files changed, 347 additions, 82 deletions
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Configure Auto-Generation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Analysis
                  </CardTitle>
                  <CardDescription>
                    Automated security vulnerability detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last scan</span>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        2 hours ago
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">High Risk</span>
                        <span className="text-sm font-medium text-red-600">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Medium Risk</span>
                        <span className="text-sm font-medium text-yellow-600">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Low Risk</span>
                        <span className="text-sm font-medium text-blue-600">5</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Security Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function RepositoryAnalysisResults({ data }: { data: CodeAnalysisResult }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Files Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.files.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(data.languages).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complexity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{data.complexity}/10</div>
              <Badge variant={data.complexity > 7 ? "destructive" : data.complexity > 4 ? "secondary" : "default"}>
                {data.complexity > 7 ? "High" : data.complexity > 4 ? "Medium" : "Low"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.securityIssues.length > 0 ? (
                data.securityIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Shield className="h-4 w-4 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{issue}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Shield className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    No security issues detected
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {data.documentation}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getLanguageColor(language: string): string {
  const colors: { [key: string]: string } = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    // Add more as needed
  };
  return colors[language] || '#8a8a8a';
}