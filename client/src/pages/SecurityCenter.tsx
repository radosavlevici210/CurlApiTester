
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Eye, 
  RefreshCw,
  Zap,
  Activity,
  Database,
  Network
} from 'lucide-react';

export default function SecurityCenter() {
  const [securityStatus, setSecurityStatus] = useState({
    overallScore: 96,
    threats: 0,
    patches: 12,
    incidents: 3,
    compliance: 98
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          Enterprise Security Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Advanced security monitoring, threat detection, and automated defense systems
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">Real-time Protection</Badge>
          <Badge variant="secondary">Auto-Defense</Badge>
          <Badge variant="secondary">Self-Repair</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityStatus.overallScore}%</div>
            <Progress value={securityStatus.overallScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Enterprise grade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStatus.threats}</div>
            <p className="text-xs text-muted-foreground">All mitigated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Patches</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{securityStatus.patches}</div>
            <p className="text-xs text-muted-foreground">Applied today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStatus.incidents}</div>
            <p className="text-xs text-muted-foreground">Resolved this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityStatus.compliance}%</div>
            <Progress value={securityStatus.compliance} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">GDPR, SOC2</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="defense">Auto-Defense</TabsTrigger>
          <TabsTrigger value="repair">Self-Repair</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Security Systems Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Firewall</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Intrusion Detection</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>DDoS Protection</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Malware Scanner</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Encryption & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Data Encryption</span>
                    <Badge variant="outline">AES-256</Badge>
                  </div>
                  <Progress value={100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Transport Security</span>
                    <Badge variant="outline">TLS 1.3</Badge>
                  </div>
                  <Progress value={100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Key Management</span>
                    <Badge variant="outline">HSM</Badge>
                  </div>
                  <Progress value={95} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Privacy Controls</span>
                    <Badge variant="outline">GDPR</Badge>
                  </div>
                  <Progress value={98} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Real-time Threat Detection
              </CardTitle>
              <CardDescription>AI-powered threat identification and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-300">No Active Threats</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        All systems secure. Last scan: 2 minutes ago
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Blocked Today</h4>
                    <div className="text-2xl font-bold text-red-600">47</div>
                    <p className="text-sm text-muted-foreground">Malicious requests</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">IPs Blocked</h4>
                    <div className="text-2xl font-bold text-orange-600">12</div>
                    <p className="text-sm text-muted-foreground">Suspicious sources</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Auto-Mitigated</h4>
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <p className="text-sm text-muted-foreground">Success rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Automated Defense Systems
              </CardTitle>
              <CardDescription>Self-defending infrastructure with AI-powered responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Adaptive Firewall</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI-powered firewall that learns and adapts to new threat patterns
                  </p>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Learning new patterns: 3 today</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Auto-Response System</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically responds to and mitigates security incidents
                  </p>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Response time: &lt;100ms average</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Predictive Defense</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Predicts and prevents attacks before they occur
                  </p>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Prevented attacks: 23 this week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repair" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                Self-Repair Systems
              </CardTitle>
              <CardDescription>Automated system maintenance and recovery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">System Health</h4>
                    <Progress value={98} className="mb-2" />
                    <p className="text-sm text-muted-foreground">98% optimal performance</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Auto-Repairs</h4>
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <p className="text-sm text-muted-foreground">Completed this month</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory optimization completed</span>
                      <Badge variant="outline" className="text-green-600">Completed</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database connection pool optimized</span>
                      <Badge variant="outline" className="text-green-600">Completed</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security patches applied</span>
                      <Badge variant="outline" className="text-blue-600">In Progress</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Compliance Dashboard
              </CardTitle>
              <CardDescription>Enterprise compliance monitoring and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">GDPR Compliance</h4>
                  <Progress value={98} className="mb-2" />
                  <p className="text-sm text-green-600 dark:text-green-400">98% compliant</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">SOC 2 Type II</h4>
                  <Progress value={96} className="mb-2" />
                  <p className="text-sm text-green-600 dark:text-green-400">96% compliant</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">ISO 27001</h4>
                  <Progress value={94} className="mb-2" />
                  <p className="text-sm text-green-600 dark:text-green-400">94% compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
