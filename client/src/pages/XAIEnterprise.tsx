
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Shield, Zap, BarChart3, FileText, Brain, Sparkles } from 'lucide-react';

export default function XAIEnterprise() {
  const { toast } = useToast();
  const [results, setResults] = useState<any>({});

  // Content Generation
  const [template, setTemplate] = useState('');
  const [context, setContext] = useState('');
  
  // Code Analysis
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  
  // Business Analysis
  const [businessData, setBusinessData] = useState('');
  const [analysisType, setAnalysisType] = useState('performance');
  
  // Document Generation
  const [documentType, setDocumentType] = useState('');
  const [requirements, setRequirements] = useState('');

  const contentMutation = useMutation({
    mutationFn: ({ template, context }: { template: string; context: string }) => 
      apiRequest("/api/xai-enterprise/generate-content", { method: "POST", body: { template, context } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, content: data }));
      toast({ title: "Content Generated", description: "Enterprise content generated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate content.", variant: "destructive" });
    }
  });

  const codeAnalysisMutation = useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) => 
      apiRequest("/api/xai-enterprise/analyze-code-security", { method: "POST", body: { code, language } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, codeAnalysis: data }));
      toast({ title: "Analysis Complete", description: "Code security analysis completed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to analyze code.", variant: "destructive" });
    }
  });

  const businessMutation = useMutation({
    mutationFn: ({ data, analysisType }: { data: string; analysisType: string }) => 
      apiRequest("/api/xai-enterprise/business-analysis", { method: "POST", body: { data: JSON.parse(data), analysisType } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, businessAnalysis: data }));
      toast({ title: "Analysis Complete", description: "Business analysis completed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to perform business analysis.", variant: "destructive" });
    }
  });

  const documentMutation = useMutation({
    mutationFn: ({ documentType, requirements }: { documentType: string; requirements: string }) => 
      apiRequest("/api/xai-enterprise/generate-document", { method: "POST", body: { documentType, requirements: JSON.parse(requirements) } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, document: data }));
      toast({ title: "Document Generated", description: "Compliant document generated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate document.", variant: "destructive" });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          XAI Enterprise Suite
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Advanced AI capabilities powered by X.AI's Grok-3 with enterprise-grade security, analytics, and compliance features.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">Enterprise Security</Badge>
          <Badge variant="secondary">Advanced Analytics</Badge>
          <Badge variant="secondary">Compliance Ready</Badge>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">
            <Sparkles className="mr-2 h-4 w-4" />
            Content Generation
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security Analysis
          </TabsTrigger>
          <TabsTrigger value="business">
            <BarChart3 className="mr-2 h-4 w-4" />
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Document Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Content Generation</CardTitle>
              <CardDescription>
                Generate professional, business-appropriate content using advanced AI templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Template</label>
                <Textarea
                  placeholder="Enter your content template (e.g., 'Create a technical proposal for...')"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Context (JSON)</label>
                <Textarea
                  placeholder='{"company": "TechCorp", "project": "AI Implementation", "budget": "$50k"}'
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={() => contentMutation.mutate({ template, context })}
                disabled={contentMutation.isPending || !template}
                className="w-full"
              >
                {contentMutation.isPending ? "Generating..." : "Generate Content"}
              </Button>
              
              {results.content && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(results.content, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Security Analysis</CardTitle>
              <CardDescription>
                Comprehensive security audit and vulnerability assessment for your code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Programming Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Code to Analyze</label>
                <Textarea
                  placeholder="Paste your code here for security analysis..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={() => codeAnalysisMutation.mutate({ code, language })}
                disabled={codeAnalysisMutation.isPending || !code}
                className="w-full"
              >
                {codeAnalysisMutation.isPending ? "Analyzing..." : "Analyze Security"}
              </Button>
              
              {results.codeAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Security Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(results.codeAnalysis, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Intelligence Analysis</CardTitle>
              <CardDescription>
                Advanced data analysis and business insights generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Type</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Analysis</SelectItem>
                    <SelectItem value="market">Market Analysis</SelectItem>
                    <SelectItem value="financial">Financial Analysis</SelectItem>
                    <SelectItem value="risk">Risk Assessment</SelectItem>
                    <SelectItem value="competitive">Competitive Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Data (JSON)</label>
                <Textarea
                  placeholder='{"revenue": [100000, 120000, 110000], "expenses": [80000, 90000, 85000], "customers": 1500}'
                  value={businessData}
                  onChange={(e) => setBusinessData(e.target.value)}
                  rows={6}
                />
              </div>
              <Button
                onClick={() => businessMutation.mutate({ data: businessData, analysisType })}
                disabled={businessMutation.isPending || !businessData}
                className="w-full"
              >
                {businessMutation.isPending ? "Analyzing..." : "Perform Analysis"}
              </Button>
              
              {results.businessAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Business Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(results.businessAnalysis, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliant Document Generation</CardTitle>
              <CardDescription>
                Generate professional documents that meet industry standards and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Input
                  placeholder="e.g., Technical Specification, Privacy Policy, Terms of Service"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements (JSON)</label>
                <Textarea
                  placeholder='{"industry": "fintech", "compliance": ["GDPR", "SOX"], "sections": ["overview", "technical", "security"]}'
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => documentMutation.mutate({ documentType, requirements })}
                disabled={documentMutation.isPending || !documentType || !requirements}
                className="w-full"
              >
                {documentMutation.isPending ? "Generating..." : "Generate Document"}
              </Button>
              
              {results.document && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(results.document, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
