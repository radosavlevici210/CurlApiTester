import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Zap, Github, Smartphone, Lock, Users, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Grok Enterprise Chat
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  © 2025 ervin210@icloud.com
                </p>
              </div>
            </div>
            <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Enterprise License Required
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Advanced AI Chat Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the power of X.AI's Grok models with enterprise-grade security, 
            multi-device sync, and advanced privacy controls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Enterprise Features
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for organizations that demand the highest standards of security, 
              performance, and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Multi-Device Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access your conversations seamlessly across all devices with real-time synchronization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your conversations are protected with military-grade encryption and privacy controls.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Github className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">GitHub Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect repositories, sync code discussions, and enhance development workflows.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize conversation patterns, content generation metrics, and usage insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Organization Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage teams, control access permissions, and collaborate securely.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced privacy modes, data retention controls, and compliance features.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Premium Models</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access to latest Grok models with enhanced capabilities and faster responses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Custom Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pre-built content generation templates for various business use cases.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Licensing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your License
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Select the plan that best fits your organization's needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For individual users</CardDescription>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• 10 conversations/month</p>
                <p>• Basic models</p>
                <p>• Community support</p>
                <p>• 1 device</p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For power users</CardDescription>
                <div className="text-3xl font-bold">$29<span className="text-lg">/mo</span></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• Unlimited conversations</p>
                <p>• All models including Grok-2</p>
                <p>• GitHub integration</p>
                <p>• 5 devices</p>
                <p>• Priority support</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For organizations</CardDescription>
                <div className="text-3xl font-bold">Custom</div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• Everything in Pro</p>
                <p>• Organization management</p>
                <p>• Advanced analytics</p>
                <p>• White-label deployment</p>
                <p>• Dedicated support</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold">Grok Enterprise Chat Platform</span>
            </div>
            <p className="text-gray-400 mb-4">
              © 2025 ervin210@icloud.com. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Enterprise License • Commercial use requires valid license • 
              Redistribution prohibited without written consent
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}