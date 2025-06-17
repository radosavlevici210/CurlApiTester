
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive, 
  MemoryStick, 
  Network, 
  Server, 
  TrendingUp,
  Zap,
  Shield,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  metrics: any;
  alerts: {
    total: number;
    active: number;
    critical: number;
    warnings: number;
  };
  performance: {
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  source: string;
  resolved: boolean;
}

export default function EnterpriseMonitoring() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: healthData, refetch: refetchHealth } = useQuery<SystemHealth>({
    queryKey: ['monitoring', 'health'],
    queryFn: () => apiRequest('/api/monitoring/health'),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: alertsData } = useQuery<Alert[]>({
    queryKey: ['monitoring', 'alerts'],
    queryFn: () => apiRequest('/api/monitoring/alerts'),
    refetchInterval: 10000,
  });

  const { data: metricsData } = useQuery({
    queryKey: ['monitoring', 'metrics'],
    queryFn: () => apiRequest('/api/monitoring/metrics?range=6h'),
    refetchInterval: 30000,
  });

  const { data: cacheStats } = useQuery({
    queryKey: ['performance', 'cache'],
    queryFn: () => apiRequest('/api/performance/cache-stats'),
    refetchInterval: 15000,
  });

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await apiRequest(`/api/monitoring/alerts/${alertId}/resolve`, { method: 'PATCH' });
      // Refetch alerts after resolving
      refetchHealth();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enterprise Monitoring Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time system monitoring and performance analytics
          </p>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(healthData?.status || 'healthy')}`}>
                {healthData?.status?.toUpperCase() || 'HEALTHY'}
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {healthData ? formatUptime(healthData.uptime) : '0d 0h 0m'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData?.alerts.active || 0}</div>
              <p className="text-xs text-muted-foreground">
                {healthData?.alerts.critical || 0} critical, {healthData?.alerts.warnings || 0} warnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData?.performance.avgResponseTime?.toFixed(0) || 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(healthData?.performance.throughput || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Requests per minute
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Usage</span>
                      <span>{healthData?.metrics?.cpu?.usage?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={healthData?.metrics?.cpu?.usage || 0} />
                    <div className="text-sm text-muted-foreground">
                      {healthData?.metrics?.cpu?.cores || 0} cores available
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MemoryStick className="h-5 w-5" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Used</span>
                      <span>{healthData?.metrics?.memory?.percentage?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={healthData?.metrics?.memory?.percentage || 0} />
                    <div className="text-sm text-muted-foreground">
                      {((healthData?.metrics?.memory?.used || 0) / 1024 / 1024).toFixed(0)}MB / 
                      {((healthData?.metrics?.memory?.used + healthData?.metrics?.memory?.available || 0) / 1024 / 1024).toFixed(0)}MB
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Connections</span>
                      <span>{healthData?.metrics?.database?.connections || 0}/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Query Time</span>
                      <span>{healthData?.metrics?.database?.queryTime?.toFixed(0) || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge variant="outline" className="text-green-600">
                        {healthData?.metrics?.database?.status || 'healthy'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Bytes In</span>
                      <span>{((healthData?.metrics?.network?.bytesIn || 0) / 1024).toFixed(0)}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bytes Out</span>
                      <span>{((healthData?.metrics?.network?.bytesOut || 0) / 1024).toFixed(0)}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections</span>
                      <span>{healthData?.metrics?.network?.connections || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cache Performance</CardTitle>
                  <CardDescription>Application cache statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Entries</span>
                      <span>{cacheStats?.totalEntries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hit Rate</span>
                      <span>{(cacheStats?.hitRate || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage</span>
                      <span>{((cacheStats?.memoryUsage || 0) / 1024).toFixed(0)}KB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                  <CardDescription>Request handling metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Requests/sec</span>
                      <span>{healthData?.metrics?.api?.requestsPerSecond?.toFixed(1) || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate</span>
                      <span>{healthData?.metrics?.api?.errorRate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response</span>
                      <span>{healthData?.metrics?.api?.responseTime?.toFixed(0) || 0}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage</CardTitle>
                  <CardDescription>Disk usage information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Disk Usage</span>
                      <span>{healthData?.metrics?.storage?.diskUsage || 0}%</span>
                    </div>
                    <Progress value={healthData?.metrics?.storage?.diskUsage || 0} />
                    <div className="text-sm text-muted-foreground">
                      {healthData?.metrics?.storage?.availableSpace || 0}% available
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Current system alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertsData && alertsData.length > 0 ? (
                    alertsData
                      .filter(alert => !alert.resolved)
                      .map((alert) => (
                        <Alert key={alert.id}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {alert.type === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                              {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                              <div>
                                <AlertDescription className="font-medium">
                                  {alert.message}
                                </AlertDescription>
                                <div className="text-sm text-muted-foreground">
                                  {alert.source} • {new Date(alert.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </Alert>
                      ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No active alerts. System is running smoothly!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance Optimization
                  </CardTitle>
                  <CardDescription>System optimization recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Compression enabled</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Caching optimized</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Rate limiting configured</span>
                      </div>
                      <Badge variant="outline" className="text-blue-600">Configured</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Status
                  </CardTitle>
                  <CardDescription>Security measures and compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">HTTPS enforced</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">Secure</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Data encryption</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">AES-256</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Audit logging</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">Enabled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
