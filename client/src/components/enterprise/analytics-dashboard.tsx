import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, MessageSquare, GitBranch, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AnalyticsData {
  type: 'chart' | 'graph' | 'timeline' | 'heatmap' | 'network' | 'mindmap';
  data: any;
  config: {
    title: string;
    description?: string;
    interactive: boolean;
    realtime: boolean;
  };
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("conversations");

  const { data: conversationAnalytics } = useQuery<AnalyticsData[]>({
    queryKey: ["/api/analytics/conversations"],
  });

  const { data: collaborationData } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/collaboration"],
  });

  const renderVisualization = (analytics: AnalyticsData) => {
    switch (analytics.type) {
      case 'heatmap':
        return <HeatmapVisualization data={analytics.data} config={analytics.config} />;
      case 'chart':
        return <ChartVisualization data={analytics.data} config={analytics.config} />;
      case 'timeline':
        return <TimelineVisualization data={analytics.data} config={analytics.config} />;
      case 'network':
        return <NetworkVisualization data={analytics.data} config={analytics.config} />;
      default:
        return <div className="p-4 text-center text-gray-500">Visualization not supported</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive insights into your AI conversations and collaboration patterns
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Enterprise
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Grok models in use</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3s</div>
                <p className="text-xs text-muted-foreground">-0.2s from last week</p>
              </CardContent>
            </Card>
          </div>

          {conversationAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {conversationAnalytics.map((analytics, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {analytics.config.title}
                      {analytics.config.realtime && (
                        <Badge variant="outline" className="text-xs">Live</Badge>
                      )}
                    </CardTitle>
                    {analytics.config.description && (
                      <CardDescription>{analytics.config.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderVisualization(analytics)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+3 new this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+28% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GitHub Repos</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Connected repositories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collaboration Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.7</div>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </CardContent>
            </Card>
          </div>

          {collaborationData && (
            <Card>
              <CardHeader>
                <CardTitle>{collaborationData.config.title}</CardTitle>
                <CardDescription>{collaborationData.config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {renderVisualization(collaborationData)}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>Average response times over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Performance metrics visualization
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Usage Distribution</CardTitle>
                <CardDescription>Which AI models are being used most frequently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">grok-2-1212</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">grok-2-vision-1212</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">grok-beta</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Intelligent analysis of your conversation patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Productivity Pattern Detected
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Your most productive conversations happen between 9-11 AM. Consider scheduling 
                    important discussions during this time.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                    Code Quality Improvement
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Your code analysis requests show 23% improvement in quality metrics 
                    over the past month.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                    Collaboration Opportunity
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Consider inviting team members to collaborate on your recent GitHub 
                    integration projects.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>AI-suggested improvements for your workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium">Enable Advanced Templates</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use business proposal templates to speed up your content creation by 40%
                    </p>
                    <Button size="sm" className="mt-2">Enable Now</Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <GitBranch className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium">Connect More Repositories</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Link your active projects for better code analysis and documentation
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">Connect GitHub</Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium">Invite Team Members</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Share conversations and collaborate on projects more effectively
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">Send Invites</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Visualization Components
function HeatmapVisualization({ data, config }: { data: any; config: any }) {
  return (
    <div className="h-64 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>{config.title} visualization</p>
        <p className="text-xs text-gray-400">Interactive heatmap coming soon</p>
      </div>
    </div>
  );
}

function ChartVisualization({ data, config }: { data: any; config: any }) {
  return (
    <div className="h-64 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>{config.title} chart</p>
        <p className="text-xs text-gray-400">Advanced charting visualization</p>
      </div>
    </div>
  );
}

function TimelineVisualization({ data, config }: { data: any; config: any }) {
  return (
    <div className="space-y-3">
      <div className="text-center text-gray-500 mb-4">
        <p className="font-medium">{config.title}</p>
      </div>
      {Array.isArray(data) && data.slice(0, 5).map((item, index) => (
        <div key={index} className="flex items-center gap-3 p-2 border-l-2 border-primary/20 pl-4">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.title || `Event ${index + 1}`}</p>
            <p className="text-xs text-gray-500">{item.category || 'General'}</p>
          </div>
          <span className="text-xs text-gray-400">
            {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
          </span>
        </div>
      ))}
    </div>
  );
}

function NetworkVisualization({ data, config }: { data: any; config: any }) {
  return (
    <div className="h-64 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>{config.title}</p>
        <p className="text-xs text-gray-400">Network graph visualization</p>
        {data?.nodes && (
          <p className="text-xs mt-2">{data.nodes.length} nodes connected</p>
        )}
      </div>
    </div>
  );
}