import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Code, FileText, Heart, Lightbulb, Sparkles } from "lucide-react";

export default function AIPlayground() {
  const { toast } = useToast();
  const [results, setResults] = useState<any>({});

  // Text Summarization
  const [summaryText, setSummaryText] = useState("");
  const summarizeMutation = useMutation({
    mutationFn: (text: string) => apiRequest("/api/ai/summarize", { method: "POST", body: { text } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, summary: data.summary }));
      toast({ title: "Summary Generated", description: "Text has been successfully summarized." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate summary.", variant: "destructive" });
    }
  });

  // Sentiment Analysis
  const [sentimentText, setSentimentText] = useState("");
  const sentimentMutation = useMutation({
    mutationFn: (text: string) => apiRequest("/api/ai/sentiment", { method: "POST", body: { text } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, sentiment: data }));
      toast({ title: "Sentiment Analyzed", description: "Text sentiment has been analyzed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to analyze sentiment.", variant: "destructive" });
    }
  });

  // Code Analysis
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const codeAnalysisMutation = useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) => 
      apiRequest("/api/ai/analyze-code", { method: "POST", body: { code, language } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, codeAnalysis: data }));
      toast({ title: "Code Analyzed", description: "Code analysis completed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to analyze code.", variant: "destructive" });
    }
  });

  // Problem Solving
  const [problem, setProblem] = useState("");
  const [domain, setDomain] = useState("");
  const problemSolveMutation = useMutation({
    mutationFn: ({ problem, domain }: { problem: string; domain: string }) => 
      apiRequest("/api/ai/solve-problem", { method: "POST", body: { problem, domain } }),
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, problemSolution: data }));
      toast({ title: "Problem Solved", description: "Solution generated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to solve problem.", variant: "destructive" });
    }
  });

  const getSentimentColor = (rating: number) => {
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return "text-green-600";
    if (quality >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          AI Playground
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the power of xAI's Grok-3 model with advanced text analysis, code review, and problem-solving capabilities.
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Summarize
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code Analysis
          </TabsTrigger>
          <TabsTrigger value="problem" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Problem Solve
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Text Summarization
              </CardTitle>
              <CardDescription>
                Transform long text into concise, meaningful summaries while preserving key information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="summary-text">Text to Summarize</Label>
                <Textarea
                  id="summary-text"
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Paste your text here for summarization..."
                  className="min-h-32"
                />
              </div>
              <Button 
                onClick={() => summarizeMutation.mutate(summaryText)}
                disabled={!summaryText.trim() || summarizeMutation.isPending}
                className="w-full"
              >
                {summarizeMutation.isPending ? "Generating Summary..." : "Generate Summary"}
              </Button>
              
              {results.summary && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{results.summary}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Analyze the emotional tone and sentiment of text with confidence scoring.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sentiment-text">Text to Analyze</Label>
                <Textarea
                  id="sentiment-text"
                  value={sentimentText}
                  onChange={(e) => setSentimentText(e.target.value)}
                  placeholder="Enter text to analyze sentiment..."
                  className="min-h-32"
                />
              </div>
              <Button 
                onClick={() => sentimentMutation.mutate(sentimentText)}
                disabled={!sentimentText.trim() || sentimentMutation.isPending}
                className="w-full"
              >
                {sentimentMutation.isPending ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
              
              {results.sentiment && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Sentiment Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`w-4 h-4 rounded-full ${
                                star <= results.sentiment.rating ? getSentimentColor(results.sentiment.rating) : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm">{results.sentiment.rating}/5</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confidence:</span>
                        <span className="text-sm">{Math.round(results.sentiment.confidence * 100)}%</span>
                      </div>
                      <Progress value={results.sentiment.confidence * 100} className="h-2" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Explanation:</span>
                      <p className="text-sm text-muted-foreground mt-1">{results.sentiment.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Analysis
              </CardTitle>
              <CardDescription>
                Get detailed analysis of your code including quality assessment, bug detection, and improvement suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Input
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g., javascript, python, java"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="code">Code to Analyze</Label>
                <Textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here for analysis..."
                  className="min-h-48 font-mono text-sm"
                />
              </div>
              <Button 
                onClick={() => codeAnalysisMutation.mutate({ code, language })}
                disabled={!code.trim() || !language.trim() || codeAnalysisMutation.isPending}
                className="w-full"
              >
                {codeAnalysisMutation.isPending ? "Analyzing Code..." : "Analyze Code"}
              </Button>
              
              {results.codeAnalysis && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Code Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Quality Score:</span>
                      <Badge className={getQualityColor(results.codeAnalysis.quality)}>
                        {results.codeAnalysis.quality}/10
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">💡 Suggestions</h4>
                        <ScrollArea className="h-24">
                          {results.codeAnalysis.suggestions.length > 0 ? (
                            <ul className="space-y-1">
                              {results.codeAnalysis.suggestions.map((suggestion: string, index: number) => (
                                <li key={index} className="text-sm text-muted-foreground">• {suggestion}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No suggestions available.</p>
                          )}
                        </ScrollArea>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">🐛 Potential Bugs</h4>
                        <ScrollArea className="h-24">
                          {results.codeAnalysis.bugs.length > 0 ? (
                            <ul className="space-y-1">
                              {results.codeAnalysis.bugs.map((bug: string, index: number) => (
                                <li key={index} className="text-sm text-red-600">• {bug}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-green-600">No bugs detected.</p>
                          )}
                        </ScrollArea>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">⚡ Improvements</h4>
                        <ScrollArea className="h-24">
                          {results.codeAnalysis.improvements.length > 0 ? (
                            <ul className="space-y-1">
                              {results.codeAnalysis.improvements.map((improvement: string, index: number) => (
                                <li key={index} className="text-sm text-muted-foreground">• {improvement}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No improvements suggested.</p>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Problem Solving
              </CardTitle>
              <CardDescription>
                Get step-by-step solutions to complex problems with detailed reasoning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain (Optional)</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., mathematics, programming, business"
                />
              </div>
              <div>
                <Label htmlFor="problem">Problem Description</Label>
                <Textarea
                  id="problem"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe the problem you need help solving..."
                  className="min-h-32"
                />
              </div>
              <Button 
                onClick={() => problemSolveMutation.mutate({ problem, domain })}
                disabled={!problem.trim() || problemSolveMutation.isPending}
                className="w-full"
              >
                {problemSolveMutation.isPending ? "Solving Problem..." : "Solve Problem"}
              </Button>
              
              {results.problemSolution && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Solution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">📋 Solution</h4>
                      <p className="text-sm leading-relaxed">{results.problemSolution.solution}</p>
                    </div>
                    
                    {results.problemSolution.steps.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">📝 Steps</h4>
                        <ol className="space-y-1">
                          {results.problemSolution.steps.map((step: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {index + 1}. {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">🧠 Reasoning</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {results.problemSolution.reasoning}
                      </p>
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