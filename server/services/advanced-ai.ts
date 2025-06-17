import OpenAI from "openai";
import type { ChatCompletionRequest } from "@shared/schema";

export class AdvancedAIService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: apiKey || process.env.XAI_API_KEY || "xai-S7I8XppKfvDbktadkCq5ShsXjXz2OmqH9cfbNx3OVUeZplqAvLMHTccTy0kI26iRfGpRS7NHJzFt9HUW",
    });
  }

  // Advanced code analysis and generation
  async analyzeCode(code: string, language: string): Promise<{
    analysis: string;
    suggestions: string[];
    security: string[];
    performance: string[];
    complexity: number;
  }> {
    const prompt = `Analyze this ${language} code and provide:
1. Overall analysis and code quality assessment
2. Improvement suggestions
3. Security vulnerabilities or concerns
4. Performance optimization opportunities
5. Complexity score (1-10)

Code:
\`\`\`${language}
${code}
\`\`\`

Format response as JSON with fields: analysis, suggestions, security, performance, complexity`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: "You are an expert code analyst and security auditor." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Advanced content generation with templates
  async generateContent(template: string, context: any): Promise<string> {
    const templates = {
      business_proposal: `Create a professional business proposal for: ${context.topic}
Target audience: ${context.audience}
Key points: ${context.points?.join(', ') || 'Not specified'}
Budget range: ${context.budget || 'Not specified'}`,

      technical_documentation: `Generate comprehensive technical documentation for: ${context.system}
Features: ${context.features?.join(', ') || 'Not specified'}
Target users: ${context.users || 'Developers'}
Include: API examples, installation steps, troubleshooting`,

      marketing_copy: `Create compelling marketing copy for: ${context.product}
Target market: ${context.market || 'General'}
Unique selling points: ${context.usp?.join(', ') || 'Not specified'}
Tone: ${context.tone || 'Professional'}`,

      legal_contract: `Draft a legal contract template for: ${context.type}
Parties: ${context.parties || 'Party A and Party B'}
Key terms: ${context.terms?.join(', ') || 'Standard terms'}
Jurisdiction: ${context.jurisdiction || 'Not specified'}`,

      code_review: `Perform detailed code review for: ${context.language} project
Focus areas: ${context.focus?.join(', ') || 'General quality'}
Standards: ${context.standards || 'Industry best practices'}
Security level: ${context.security || 'Standard'}`
    };

    const selectedTemplate = templates[template as keyof typeof templates] || context.custom_prompt;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: "You are an expert content creator with deep knowledge across business, technical, and legal domains." },
        { role: "user", content: selectedTemplate }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "";
  }

  // Multi-modal analysis (text + images)
  async analyzeMultiModal(text: string, imageBase64?: string): Promise<{
    textAnalysis: string;
    imageAnalysis?: string;
    combinedInsights: string;
  }> {
    const messages: any[] = [
      { role: "system", content: "You are an expert analyst capable of processing both text and visual information." }
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `Analyze this content: ${text}` },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      });
    } else {
      messages.push({ role: "user", content: `Analyze this content: ${text}` });
    }

    const response = await this.client.chat.completions.create({
      model: imageBase64 ? "grok-2-vision-1212" : "grok-2-1212",
      messages,
      temperature: 0.5,
    });

    const content = response.choices[0].message.content || "";
    
    return {
      textAnalysis: content,
      imageAnalysis: imageBase64 ? "Visual analysis included in combined response" : undefined,
      combinedInsights: content
    };
  }

  // Advanced reasoning and problem solving
  async solveComplexProblem(problem: string, context?: any): Promise<{
    solution: string;
    steps: string[];
    alternatives: string[];
    risks: string[];
    timeline: string;
  }> {
    const prompt = `Solve this complex problem: ${problem}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide:
1. Primary solution approach
2. Step-by-step implementation
3. Alternative approaches
4. Potential risks and mitigation
5. Estimated timeline

Format as JSON with fields: solution, steps, alternatives, risks, timeline`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: "You are an expert problem solver and strategic consultant with deep analytical capabilities." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Real-time collaborative editing suggestions
  async getCollaborativeSuggestions(content: string, userRole: string, context: any): Promise<{
    suggestions: string[];
    improvements: string[];
    questions: string[];
  }> {
    const prompt = `As a ${userRole}, review this collaborative content and provide:
1. Specific suggestions for improvement
2. Areas that need clarification
3. Questions to ask other collaborators

Content: ${content}
Context: ${JSON.stringify(context)}

Format as JSON with fields: suggestions, improvements, questions`;

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: "You are an expert collaborative editor and consultant." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }
}

export const advancedAI = new AdvancedAIService();