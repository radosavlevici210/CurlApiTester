import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Image, 
  Code, 
  FileText, 
  Lightbulb, 
  BarChart3,
  Languages,
  HelpCircle,
  Database,
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react';

interface APIResponse {
  success: boolean;
  [key: string]: any;
}

export default function AIStudio() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Chat completion
  const [chatForm, setChatForm] = useState({
    prompt: '',
    model: 'gpt-4o',
    temperature: 0.7,
    systemPrompt: ''
  });

  const chatMutation = useMutation({
    mutationFn: async (data: typeof chatForm) => {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data: APIResponse) => {
      if (data.success) {
        setResponses(prev => ({ ...prev, chat: data.response }));
        toast({ title: "Chat completed", description: "AI response generated successfully" });
      } else {
        toast({ title: "Error", description: "Failed to get AI response", variant: "destructive" });
      }
    }
  });

  // Image analysis
  const [imageForm, setImageForm] = useState({
    imageBase64: '',
    prompt: '',
    model: 'gpt-4o'
  });

  const imageMutation = useMutation({
    mutationFn: async (data: typeof imageForm) => {
      const response = await fetch('/api/openai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data: APIResponse) => {
      if (data.success) {
        setResponses(prev => ({ ...prev, image: data.analysis }));
        toast({ title: "Image analyzed", description: "Analysis completed successfully" });
      }
    }
  });

  // Code analysis
  const [codeForm, setCodeForm] = useState({
    code: '',
    language: 'javascript',
    analysisType: 'quality' as 'security' | 'performance' | 'quality' | 'bugs'
  });

  const codeMutation = useMutation({
    mutationFn: async (data: typeof codeForm) => {
      const response = await fetch('/api/openai/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data: APIResponse) => {
      if (data.success) {
        setResponses(prev => ({ ...prev, code: data.analysis }));
        toast({ title: "Code analyzed", description: "Analysis completed successfully" });
      }
    }
  });

  // Document generation
  const [docForm, setDocForm] = useState({
    documentType: 'proposal' as 'proposal' | 'report' | 'email' | 'contract',
    context: {},
    requirements: ''
  });

  const docMutation = useMutation({
    mutationFn: async (data: typeof docForm) => {
      const response = await fetch('/api/openai/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data: APIResponse) => {
      if (data.success) {
        setResponses(prev => ({ ...prev, document: data.document }));
        toast({ title: "Document generated", description: "Business document created successfully" });
      }
    }
  });

  // Creative content
  const [contentForm, setContentForm] = useState({
    contentType: 'article' as 'story' | 'article' | 'marketing' | 'social',
    topic: '',
    tone: 'professional' as 'professional' | 'casual' | 'technical' | 'creative',
    length: 'medium' as 'short' | 'medium' | 'long'
  });

  const contentMutation = useMutation({
    mutationFn: async (data: typeof contentForm) => {
      const response = await fetch('/api/openai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data: APIResponse) => {
      if (data.success) {
        setResponses(prev => ({ ...prev, content: data.content }));
        toast({ title: "Content generated", description: "Creative content created successfully" });
      }
    }
  });

  // Sentiment analysis
  const [sentimentForm, setSentimentForm] = useState({ text: '' });

  const sentimentMutation = useMutation({
    mutationFn: async (data: typeof sentimentForm) => {
      const response = await fetch('/api/openai/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data: APIResponse) => {
      if (data.success) {
        setResponses(prev => ({ ...prev, sentiment: data.sentiment }));
        toast({ title: "Sentiment analyzed", description: "Analysis completed successfully" });
      }
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];
        setImageForm(prev => ({ ...prev, imageBase64: base64Data }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Studio</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced AI capabilities powered by OpenAI GPT-4o
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Vision
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Creative
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Chat Completion */}
        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Enhanced Chat Completion
              </CardTitle>
              <CardDescription>
                Advanced conversational AI with customizable parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <Select value={chatForm.model} onValueChange={(value) => 
                    setChatForm(prev => ({ ...prev, model: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Temperature: {chatForm.temperature}</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={chatForm.temperature}
                    onChange={(e) => setChatForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">System Prompt (Optional)</label>
                <Textarea
                  placeholder="Define the AI's behavior and role..."
                  value={chatForm.systemPrompt}
                  onChange={(e) => setChatForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  placeholder="Enter your message or question..."
                  value={chatForm.prompt}
                  onChange={(e) => setChatForm(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={() => chatMutation.mutate(chatForm)}
                disabled={chatMutation.isPending || !chatForm.prompt}
                className="w-full"
              >
                {chatMutation.isPending ? 'Generating...' : 'Send Message'}
              </Button>
              
              {responses.chat && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">AI Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{responses.chat}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Analysis */}
        <TabsContent value="image" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Vision Analysis
              </CardTitle>
              <CardDescription>
                Analyze images with AI-powered vision capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Analysis Prompt</label>
                <Textarea
                  placeholder="What would you like to know about this image?"
                  value={imageForm.prompt}
                  onChange={(e) => setImageForm(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={() => imageMutation.mutate(imageForm)}
                disabled={imageMutation.isPending || !imageForm.imageBase64 || !imageForm.prompt}
                className="w-full"
              >
                {imageMutation.isPending ? 'Analyzing...' : 'Analyze Image'}
              </Button>
              
              {responses.image && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{responses.image}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Analysis */}
        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive code review and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select value={codeForm.language} onValueChange={(value) => 
                    setCodeForm(prev => ({ ...prev, language: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Analysis Type</label>
                  <Select value={codeForm.analysisType} onValueChange={(value: any) => 
                    setCodeForm(prev => ({ ...prev, analysisType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quality">Code Quality</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="bugs">Bug Detection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Code</label>
                <Textarea
                  placeholder="Paste your code here..."
                  value={codeForm.code}
                  onChange={(e) => setCodeForm(prev => ({ ...prev, code: e.target.value }))}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={() => codeMutation.mutate(codeForm)}
                disabled={codeMutation.isPending || !codeForm.code}
                className="w-full"
              >
                {codeMutation.isPending ? 'Analyzing...' : 'Analyze Code'}
              </Button>
              
              {responses.code && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      Code Analysis Results
                      <Badge variant="outline">{codeForm.analysisType}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{responses.code}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Generation */}
        <TabsContent value="document" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Business Document Generation
              </CardTitle>
              <CardDescription>
                Generate professional business documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Document Type</label>
                <Select value={docForm.documentType} onValueChange={(value: any) => 
                  setDocForm(prev => ({ ...prev, documentType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal">Business Proposal</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="email">Professional Email</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Context (JSON format)</label>
                <Textarea
                  placeholder='{"company": "ACME Corp", "project": "Website Redesign", "budget": "$50,000"}'
                  value={JSON.stringify(docForm.context)}
                  onChange={(e) => {
                    try {
                      setDocForm(prev => ({ ...prev, context: JSON.parse(e.target.value || '{}') }));
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Additional Requirements</label>
                <Textarea
                  placeholder="Any specific requirements or details..."
                  value={docForm.requirements}
                  onChange={(e) => setDocForm(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={() => docMutation.mutate(docForm)}
                disabled={docMutation.isPending}
                className="w-full"
              >
                {docMutation.isPending ? 'Generating...' : 'Generate Document'}
              </Button>
              
              {responses.document && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{responses.document}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creative Content */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Creative Content Generation
              </CardTitle>
              <CardDescription>
                Generate engaging creative content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Content Type</label>
                  <Select value={contentForm.contentType} onValueChange={(value: any) => 
                    setContentForm(prev => ({ ...prev, contentType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="marketing">Marketing Copy</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={contentForm.tone} onValueChange={(value: any) => 
                    setContentForm(prev => ({ ...prev, tone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Length</label>
                  <Select value={contentForm.length} onValueChange={(value: any) => 
                    setContentForm(prev => ({ ...prev, length: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Topic</label>
                <Input
                  placeholder="Enter the topic or subject..."
                  value={contentForm.topic}
                  onChange={(e) => setContentForm(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={() => contentMutation.mutate(contentForm)}
                disabled={contentMutation.isPending || !contentForm.topic}
                className="w-full"
              >
                {contentMutation.isPending ? 'Creating...' : 'Generate Content'}
              </Button>
              
              {responses.content && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{responses.content}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Analysis */}
        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Analyze emotional tone and sentiment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Text to Analyze</label>
                <Textarea
                  placeholder="Enter the text you want to analyze..."
                  value={sentimentForm.text}
                  onChange={(e) => setSentimentForm(prev => ({ ...prev, text: e.target.value }))}
                  rows={6}
                />
              </div>
              
              <Button 
                onClick={() => sentimentMutation.mutate(sentimentForm)}
                disabled={sentimentMutation.isPending || !sentimentForm.text}
                className="w-full"
              >
                {sentimentMutation.isPending ? 'Analyzing...' : 'Analyze Sentiment'}
              </Button>
              
              {responses.sentiment && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Sentiment Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sentiment:</span>
                      <Badge variant={
                        responses.sentiment.sentiment === 'positive' ? 'default' :
                        responses.sentiment.sentiment === 'negative' ? 'destructive' :
                        'secondary'
                      }>
                        {responses.sentiment.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Confidence:</span>
                      <span className="text-sm">{(responses.sentiment.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Emotions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {responses.sentiment.emotions?.map((emotion: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Summary:</span>
                      <p className="text-sm mt-1">{responses.sentiment.summary}</p>
                    </div>
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