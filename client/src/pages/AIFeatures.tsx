import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Code, BookOpen, Bug, Calendar, PenTool, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CodeGenerationResult {
  code: string;
  tests: string;
  documentation: string;
  explanation: string;
}

interface ConceptExplanation {
  explanation: string;
  keyPoints: string[];
  examples: string[];
  relatedConcepts: string[];
  practiceExercises: string[];
}

interface DebugResult {
  analysis: string;
  solutions: Array<{
    approach: string;
    code: string;
    explanation: string;
    pros: string[];
    cons: string[];
  }>;
  prevention: string[];
}

interface ProjectPlan {
  overview: string;
  phases: Array<{
    name: string;
    duration: string;
    tasks: string[];
    deliverables: string[];
  }>;
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    tools: string[];
  };
  riskAnalysis: Array<{
    risk: string;
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  recommendations: string[];
}

interface CreativeContent {
  content: string;
  title: string;
  outline: string[];
  keywords: string[];
  improvements: string[];
}

export default function AIFeatures() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("code-generator");

  // Code Generator State
  const [codePrompt, setCodePrompt] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [includeTests, setIncludeTests] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [codeResult, setCodeResult] = useState<CodeGenerationResult | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  // Learning Assistant State
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState("");
  const [context, setContext] = useState("");
  const [conceptResult, setConceptResult] = useState<ConceptExplanation | null>(null);
  const [conceptLoading, setConceptLoading] = useState(false);

  // Debug Assistant State
  const [debugCode, setDebugCode] = useState("");
  const [debugError, setDebugError] = useState("");
  const [debugLanguage, setDebugLanguage] = useState("");
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // Project Planner State
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTimeline, setProjectTimeline] = useState("");
  const [projectComplexity, setProjectComplexity] = useState("");
  const [projectResult, setProjectResult] = useState<ProjectPlan | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);

  // Creative Writer State
  const [contentType, setContentType] = useState("");
  const [contentPrompt, setContentPrompt] = useState("");
  const [contentTone, setContentTone] = useState("");
  const [contentLength, setContentLength] = useState("");
  const [contentResult, setContentResult] = useState<CreativeContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  const generateCode = async () => {
    if (!codePrompt || !codeLanguage) {
      toast({
        title: "Missing Information",
        description: "Please provide both prompt and programming language.",
        variant: "destructive",
      });
      return;
    }

    setCodeLoading(true);
    try {
      const result = await apiRequest("/api/ai/generate-code", "POST", {
        prompt: codePrompt,
        language: codeLanguage,
        includeTests,
        includeDocumentation,
      });
      setCodeResult(result);
      toast({
        title: "Code Generated",
        description: "Production-ready code has been generated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate code.",
        variant: "destructive",
      });
    } finally {
      setCodeLoading(false);
    }
  };

  const explainConcept = async () => {
    if (!concept || !level) {
      toast({
        title: "Missing Information",
        description: "Please provide both concept and skill level.",
        variant: "destructive",
      });
      return;
    }

    setConceptLoading(true);
    try {
      const result = await apiRequest("/api/ai/explain-concept", "POST", {
        concept,
        level,
        context,
      });
      setConceptResult(result);
      toast({
        title: "Concept Explained",
        description: "Personalized explanation has been generated.",
      });
    } catch (error: any) {
      toast({
        title: "Explanation Failed",
        description: error.message || "Failed to explain concept.",
        variant: "destructive",
      });
    } finally {
      setConceptLoading(false);
    }
  };

  const debugCode = async () => {
    if (!debugCode || !debugError || !debugLanguage) {
      toast({
        title: "Missing Information",
        description: "Please provide code, error message, and programming language.",
        variant: "destructive",
      });
      return;
    }

    setDebugLoading(true);
    try {
      const result = await apiRequest("/api/ai/debug-code", "POST", {
        code: debugCode,
        error: debugError,
        language: debugLanguage,
      });
      setDebugResult(result);
      toast({
        title: "Debug Analysis Complete",
        description: "Multiple solution approaches have been identified.",
      });
    } catch (error: any) {
      toast({
        title: "Debug Failed",
        description: error.message || "Failed to debug code.",
        variant: "destructive",
      });
    } finally {
      setDebugLoading(false);
    }
  };

  const planProject = async () => {
    if (!projectDescription || !projectTimeline || !projectComplexity) {
      toast({
        title: "Missing Information",
        description: "Please provide description, timeline, and complexity level.",
        variant: "destructive",
      });
      return;
    }

    setProjectLoading(true);
    try {
      const result = await apiRequest("/api/ai/plan-project", "POST", {
        description: projectDescription,
        timeline: projectTimeline,
        complexity: projectComplexity,
      });
      setProjectResult(result);
      toast({
        title: "Project Plan Created",
        description: "Comprehensive project plan with phases and risk analysis.",
      });
    } catch (error: any) {
      toast({
        title: "Planning Failed",
        description: error.message || "Failed to create project plan.",
        variant: "destructive",
      });
    } finally {
      setProjectLoading(false);
    }
  };

  const generateContent = async () => {
    if (!contentType || !contentPrompt || !contentTone || !contentLength) {
      toast({
        title: "Missing Information",
        description: "Please fill in all content generation fields.",
        variant: "destructive",
      });
      return;
    }

    setContentLoading(true);
    try {
      const result = await apiRequest("/api/ai/generate-creative-content", "POST", {
        type: contentType,
        prompt: contentPrompt,
        tone: contentTone,
        length: contentLength,
      });
      setContentResult(result);
      toast({
        title: "Content Generated",
        description: "High-quality content has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content.",
        variant: "destructive",
      });
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Features Suite</h1>
        <p className="text-muted-foreground">
          Powered by xAI Grok-2 for advanced reasoning and comprehensive solutions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="code-generator" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Code Generator
          </TabsTrigger>
          <TabsTrigger value="learning-assistant" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learning Assistant
          </TabsTrigger>
          <TabsTrigger value="debug-assistant" className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug Assistant
          </TabsTrigger>
          <TabsTrigger value="project-planner" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Project Planner
          </TabsTrigger>
          <TabsTrigger value="creative-writer" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Creative Writer
          </TabsTrigger>
        </TabsList>

        {/* Code Generator Tab */}
        <TabsContent value="code-generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                AI Code Generator
              </CardTitle>
              <CardDescription>
                Generate production-ready code with tests and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code-prompt">Code Description</Label>
                  <Textarea
                    id="code-prompt"
                    placeholder="Describe what you want to build..."
                    value={codePrompt}
                    onChange={(e) => setCodePrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code-language">Programming Language</Label>
                    <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="ruby">Ruby</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-tests"
                        checked={includeTests}
                        onCheckedChange={setIncludeTests}
                      />
                      <Label htmlFor="include-tests">Include Tests</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-docs"
                        checked={includeDocumentation}
                        onCheckedChange={setIncludeDocumentation}
                      />
                      <Label htmlFor="include-docs">Include Documentation</Label>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={generateCode} disabled={codeLoading} className="w-full">
                {codeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Code...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {codeResult && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <p className="text-sm text-muted-foreground">{codeResult.explanation}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Code Implementation</Label>
                  <ScrollArea className="h-64 w-full rounded-md border">
                    <pre className="p-4 text-sm">
                      <code>{codeResult.code}</code>
                    </pre>
                  </ScrollArea>
                </div>
                {codeResult.tests && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Unit Tests</Label>
                      <ScrollArea className="h-48 w-full rounded-md border">
                        <pre className="p-4 text-sm">
                          <code>{codeResult.tests}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  </>
                )}
                {codeResult.documentation && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Documentation</Label>
                      <ScrollArea className="h-32 w-full rounded-md border">
                        <div className="p-4 text-sm whitespace-pre-wrap">
                          {codeResult.documentation}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Learning Assistant Tab */}
        <TabsContent value="learning-assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Assistant
              </CardTitle>
              <CardDescription>
                Get personalized explanations for any technical concept
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="concept">Technical Concept</Label>
                  <Input
                    id="concept"
                    placeholder="e.g., Machine Learning, React Hooks, Database Indexing"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Skill Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Any specific context or use case..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={explainConcept} disabled={conceptLoading} className="w-full">
                {conceptLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Explaining Concept...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explain Concept
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {conceptResult && (
            <Card>
              <CardHeader>
                <CardTitle>Concept Explanation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {conceptResult.explanation}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Key Points</Label>
                  <ul className="list-disc list-inside space-y-1">
                    {conceptResult.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Examples</Label>
                  <div className="space-y-2">
                    {conceptResult.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-muted rounded text-sm">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Related Concepts</Label>
                  <div className="flex flex-wrap gap-2">
                    {conceptResult.relatedConcepts.map((related, index) => (
                      <Badge key={index} variant="secondary">{related}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Practice Exercises</Label>
                  <ul className="list-decimal list-inside space-y-1">
                    {conceptResult.practiceExercises.map((exercise, index) => (
                      <li key={index} className="text-sm">{exercise}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Debug Assistant Tab */}
        <TabsContent value="debug-assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Debug Assistant
              </CardTitle>
              <CardDescription>
                AI-powered code debugging with multiple solution approaches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="debug-language">Programming Language</Label>
                <Select value={debugLanguage} onValueChange={setDebugLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="debug-code">Problematic Code</Label>
                <Textarea
                  id="debug-code"
                  placeholder="Paste your code here..."
                  value={debugCode}
                  onChange={(e) => setDebugCode(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debug-error">Error Message</Label>
                <Textarea
                  id="debug-error"
                  placeholder="Paste the error message or describe the issue..."
                  value={debugError}
                  onChange={(e) => setDebugError(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={debugCode} disabled={debugLoading} className="w-full">
                {debugLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Issue...
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4 mr-2" />
                    Debug Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {debugResult && (
            <Card>
              <CardHeader>
                <CardTitle>Debug Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Root Cause Analysis</Label>
                  <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {debugResult.analysis}
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <Label>Solution Approaches</Label>
                  {debugResult.solutions.map((solution, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{solution.approach}</CardTitle>
                        <CardDescription>{solution.explanation}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Code Solution</Label>
                          <ScrollArea className="h-32 w-full rounded-md border">
                            <pre className="p-3 text-sm">
                              <code>{solution.code}</code>
                            </pre>
                          </ScrollArea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-600">Pros</Label>
                            <ul className="list-disc list-inside space-y-1">
                              {solution.pros.map((pro, proIndex) => (
                                <li key={proIndex} className="text-sm text-green-700">{pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-orange-600">Considerations</Label>
                            <ul className="list-disc list-inside space-y-1">
                              {solution.cons.map((con, conIndex) => (
                                <li key={conIndex} className="text-sm text-orange-700">{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Prevention Strategies</Label>
                  <ul className="list-disc list-inside space-y-1">
                    {debugResult.prevention.map((strategy, index) => (
                      <li key={index} className="text-sm">{strategy}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Project Planner Tab */}
        <TabsContent value="project-planner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Project Planner
              </CardTitle>
              <CardDescription>
                Comprehensive project planning with phases, tech stack, and risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-description">Project Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe your project in detail..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-timeline">Timeline</Label>
                  <Input
                    id="project-timeline"
                    placeholder="e.g., 3 months, 6 weeks"
                    value={projectTimeline}
                    onChange={(e) => setProjectTimeline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-complexity">Complexity Level</Label>
                  <Select value={projectComplexity} onValueChange={setProjectComplexity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={planProject} disabled={projectLoading} className="w-full">
                {projectLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Project Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {projectResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{projectResult.overview}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Phases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectResult.phases.map((phase, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{phase.name}</CardTitle>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Tasks</Label>
                          <ul className="list-disc list-inside space-y-1">
                            {phase.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="text-sm">{task}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Deliverables</Label>
                          <ul className="list-disc list-inside space-y-1">
                            {phase.deliverables.map((deliverable, delIndex) => (
                              <li key={delIndex} className="text-sm font-medium">{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Tech Stack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Frontend</Label>
                      <div className="flex flex-wrap gap-1">
                        {projectResult.techStack.frontend.map((tech, index) => (
                          <Badge key={index} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Backend</Label>
                      <div className="flex flex-wrap gap-1">
                        {projectResult.techStack.backend.map((tech, index) => (
                          <Badge key={index} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Database</Label>
                      <div className="flex flex-wrap gap-1">
                        {projectResult.techStack.database.map((tech, index) => (
                          <Badge key={index} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tools</Label>
                      <div className="flex flex-wrap gap-1">
                        {projectResult.techStack.tools.map((tech, index) => (
                          <Badge key={index} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projectResult.riskAnalysis.map((risk, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{risk.risk}</h4>
                        <Badge 
                          variant={risk.impact === 'high' ? 'destructive' : 
                                  risk.impact === 'medium' ? 'default' : 'secondary'}
                        >
                          {risk.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {projectResult.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm">{recommendation}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Creative Writer Tab */}
        <TabsContent value="creative-writer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                Creative Writer
              </CardTitle>
              <CardDescription>
                Generate high-quality content for blogs, emails, stories, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="technical">Technical Writing</SelectItem>
                      <SelectItem value="marketing">Marketing Copy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-tone">Tone</Label>
                  <Input
                    id="content-tone"
                    placeholder="e.g., professional, casual, friendly"
                    value={contentTone}
                    onChange={(e) => setContentTone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-length">Length</Label>
                <Select value={contentLength} onValueChange={setContentLength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (200-400 words)</SelectItem>
                    <SelectItem value="medium">Medium (500-800 words)</SelectItem>
                    <SelectItem value="long">Long (1000-1500 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-prompt">Content Brief</Label>
                <Textarea
                  id="content-prompt"
                  placeholder="Describe what you want to write about..."
                  value={contentPrompt}
                  onChange={(e) => setContentPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={generateContent} disabled={contentLoading} className="w-full">
                {contentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {contentResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{contentResult.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {contentResult.content}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Outline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {contentResult.outline.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Keywords Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {contentResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {contentResult.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm">{improvement}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}