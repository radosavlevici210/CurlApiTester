
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  GitBranch, 
  Star, 
  GitFork, 
  AlertTriangle, 
  Shield, 
  CheckCircle,
  Plus,
  Refresh,
  Eye,
  Code,
  Users
} from 'lucide-react';

export default function GitHubManagement() {
  const { toast } = useToast();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const mockRepositories = [
    {
      id: 'ervin210/xai-enterprise-chat',
      name: 'xai-enterprise-chat',
      owner: 'ervin210',
      description: 'Enterprise AI chat platform with advanced security',
      language: 'TypeScript',
      stars: 127,
      forks: 23,
      issues: 3,
      securityScore: 96,
      codeQuality: 89,
      lastUpdated: new Date(),
      vulnerabilities: [],
      recommendations: ['Add more unit tests', 'Update documentation']
    },
    {
      id: 'ervin210/ai-monitoring-system',
      name: 'ai-monitoring-system',
      owner: 'ervin210',
      description: 'Real-time monitoring and analytics platform',
      language: 'JavaScript',
      stars: 84,
      forks: 12,
      issues: 1,
      securityScore: 92,
      codeQuality: 85,
      lastUpdated: new Date(),
      vulnerabilities: ['CVE-2024-1234'],
      recommendations: ['Fix security vulnerability', 'Improve error handling']
    }
  ];

  useEffect(() => {
    setRepositories(mockRepositories);
  }, []);

  const getSecurityBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getQualityBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <GitBranch className="h-8 w-8 text-blue-600" />
          GitHub Repository Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Automated repository analysis, security monitoring, and code quality management
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">Automated Security</Badge>
          <Badge variant="secondary">Code Quality Analysis</Badge>
          <Badge variant="secondary">Repository Insights</Badge>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Button onClick={() => setLoading(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Repository
          </Button>
          <Button variant="outline" onClick={() => setLoading(true)}>
            <Refresh className="mr-2 h-4 w-4" />
            Refresh All
          </Button>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search repositories..." className="w-64" />
          <Button variant="outline">Search</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Eye className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="quality">
            <Code className="mr-2 h-4 w-4" />
            Code Quality
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Users className="mr-2 h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{repositories.length}</div>
                <p className="text-xs text-muted-foreground">Active repositories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94%</div>
                <p className="text-xs text-muted-foreground">Average security rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
                <Code className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">87%</div>
                <p className="text-xs text-muted-foreground">Average quality score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">211</div>
                <p className="text-xs text-muted-foreground">Across all repositories</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {repositories.map((repo) => (
              <Card key={repo.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        {repo.name}
                      </CardTitle>
                      <CardDescription>{repo.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSecurityBadgeColor(repo.securityScore)}>
                        Security: {repo.securityScore}%
                      </Badge>
                      <Badge className={getQualityBadgeColor(repo.codeQuality)}>
                        Quality: {repo.codeQuality}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{repo.stars} stars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{repo.forks} forks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">{repo.issues} issues</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{repo.language}</span>
                    </div>
                  </div>

                  {repo.vulnerabilities.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-semibold">Security Vulnerabilities</span>
                      </div>
                      {repo.vulnerabilities.map((vuln: string, index: number) => (
                        <div key={index} className="text-sm text-red-700 dark:text-red-300">
                          • {vuln}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Security Score</span>
                      <span>{repo.securityScore}%</span>
                    </div>
                    <Progress value={repo.securityScore} className="h-2" />
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Code Quality</span>
                      <span>{repo.codeQuality}%</span>
                    </div>
                    <Progress value={repo.codeQuality} className="h-2" />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Security Scan</Button>
                    <Button size="sm" variant="outline">Generate Docs</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Security Dashboard
              </CardTitle>
              <CardDescription>Automated security monitoring and vulnerability management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Secure Repositories</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {repositories.filter(r => r.vulnerabilities.length === 0).length}
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold">Vulnerabilities</h4>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {repositories.reduce((sum, r) => sum + r.vulnerabilities.length, 0)}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Refresh className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Auto-Patches</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">12</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Actions</CardTitle>
              <CardDescription>Self-managing repository maintenance and improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Automated Security Patches</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically apply critical security updates
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Code Quality Monitoring</h4>
                      <p className="text-sm text-muted-foreground">
                        Continuous code quality analysis and improvement suggestions
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Documentation Generation</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate and update project documentation
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">Scheduled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
