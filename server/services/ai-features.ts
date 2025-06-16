import OpenAI from "openai";

export class AIFeaturesService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: apiKey || process.env.XAI_API_KEY,
    });
  }

  // AI Code Generator
  async generateCode(prompt: string, language: string, includeTests: boolean = true, includeDocumentation: boolean = true): Promise<{
    code: string;
    tests: string;
    documentation: string;
    explanation: string;
  }> {
    const systemPrompt = `You are an expert software engineer. Generate production-ready ${language} code with proper error handling, best practices, and clean architecture.
    
    Requirements:
    - Write clean, maintainable, and well-structured code
    - Include proper error handling and validation
    - Follow industry best practices and coding standards
    - Add inline comments where necessary
    ${includeTests ? '- Include comprehensive unit tests' : ''}
    ${includeDocumentation ? '- Provide detailed documentation' : ''}
    
    Respond with a JSON object containing:
    {
      "code": "main implementation code",
      "tests": "unit tests if requested",
      "documentation": "detailed documentation if requested", 
      "explanation": "brief explanation of the implementation approach"
    }`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Learning Assistant
  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced', context?: string): Promise<{
    explanation: string;
    keyPoints: string[];
    examples: string[];
    relatedConcepts: string[];
    practiceExercises: string[];
  }> {
    const systemPrompt = `You are an expert technical educator. Provide clear, personalized explanations for technical concepts based on the user's skill level.
    
    Guidelines:
    - Adapt explanation complexity to the specified level (${level})
    - Use analogies and real-world examples
    - Break down complex concepts into digestible parts
    - Provide practical examples and exercises
    - Suggest related concepts for further learning
    
    Respond with a JSON object containing:
    {
      "explanation": "detailed explanation adapted to skill level",
      "keyPoints": ["array of key points to remember"],
      "examples": ["array of practical examples"],
      "relatedConcepts": ["array of related concepts to explore"],
      "practiceExercises": ["array of hands-on exercises"]
    }`;

    const userPrompt = context 
      ? `Explain "${concept}" at ${level} level. Context: ${context}`
      : `Explain "${concept}" at ${level} level.`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Debug Assistant
  async debugCode(code: string, error: string, language: string): Promise<{
    analysis: string;
    solutions: Array<{
      approach: string;
      code: string;
      explanation: string;
      pros: string[];
      cons: string[];
    }>;
    prevention: string[];
  }> {
    const systemPrompt = `You are an expert debugging assistant. Analyze code issues and provide multiple solution approaches with detailed explanations.
    
    Guidelines:
    - Identify the root cause of the issue
    - Provide at least 2-3 different solution approaches
    - Explain pros and cons of each approach
    - Include prevention strategies
    - Focus on maintainable, production-ready solutions
    
    Respond with a JSON object containing:
    {
      "analysis": "detailed analysis of the issue and root cause",
      "solutions": [
        {
          "approach": "solution approach name",
          "code": "corrected code",
          "explanation": "how this solution works",
          "pros": ["advantages of this approach"],
          "cons": ["disadvantages or considerations"]
        }
      ],
      "prevention": ["strategies to prevent similar issues"]
    }`;

    const userPrompt = `Debug this ${language} code:

Code:
\`\`\`${language}
${code}
\`\`\`

Error:
${error}`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Project Planner
  async planProject(description: string, timeline: string, complexity: 'simple' | 'medium' | 'complex'): Promise<{
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
  }> {
    const systemPrompt = `You are an expert project manager and technical architect. Create comprehensive project plans with realistic timelines, technology recommendations, and risk analysis.
    
    Guidelines:
    - Break projects into logical phases
    - Recommend appropriate technology stacks
    - Identify potential risks and mitigation strategies
    - Provide realistic timelines based on complexity
    - Include specific deliverables for each phase
    
    Respond with a JSON object containing:
    {
      "overview": "project summary and objectives",
      "phases": [
        {
          "name": "phase name",
          "duration": "estimated duration",
          "tasks": ["specific tasks"],
          "deliverables": ["expected deliverables"]
        }
      ],
      "techStack": {
        "frontend": ["recommended frontend technologies"],
        "backend": ["recommended backend technologies"],
        "database": ["recommended database solutions"],
        "tools": ["development and deployment tools"]
      },
      "riskAnalysis": [
        {
          "risk": "potential risk description",
          "impact": "low|medium|high",
          "mitigation": "mitigation strategy"
        }
      ],
      "recommendations": ["key recommendations and best practices"]
    }`;

    const userPrompt = `Plan a ${complexity} project: ${description}
Timeline: ${timeline}`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Creative Writer
  async generateContent(type: 'blog' | 'email' | 'story' | 'technical' | 'marketing', prompt: string, tone: string, length: 'short' | 'medium' | 'long'): Promise<{
    content: string;
    title: string;
    outline: string[];
    keywords: string[];
    improvements: string[];
  }> {
    const lengthMap = {
      short: '200-400 words',
      medium: '500-800 words', 
      long: '1000-1500 words'
    };

    const systemPrompt = `You are an expert content writer specializing in ${type} content. Create high-quality, engaging content with proper structure and flow.
    
    Guidelines:
    - Write in ${tone} tone
    - Target length: ${lengthMap[length]}
    - Use proper formatting and structure
    - Include engaging headlines and subheadings where appropriate
    - Optimize for readability and engagement
    - Ensure content is original and valuable
    
    Respond with a JSON object containing:
    {
      "content": "complete content piece",
      "title": "compelling title",
      "outline": ["content structure outline"],
      "keywords": ["relevant keywords used"],
      "improvements": ["suggestions for further enhancement"]
    }`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Test XAI Connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Testing. Just say hi and hello world and nothing else." }
        ],
        temperature: 0,
      });

      return {
        success: true,
        message: response.choices[0].message.content || "Connection successful"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Connection failed"
      };
    }
  }
}

export const aiFeaturesService = new AIFeaturesService();