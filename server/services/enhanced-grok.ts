import OpenAI from "openai";

export class EnhancedGrokService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: apiKey || process.env.XAI_API_KEY || "",
    });
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

    const response = await this.client.chat.completions.create({
      model: "grok-3-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  }

  async analyzeSentiment(text: string): Promise<{
    rating: number;
    confidence: number;
    explanation: string;
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: "grok-3-latest",
        messages: [
          {
            role: "system",
            content:
              "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number, 'explanation': string }",
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        explanation: result.explanation || "Analysis completed",
      };
    } catch (error) {
      throw new Error("Failed to analyze sentiment: " + (error as Error).message);
    }
  }

  async generateCreativeContent(prompt: string, contentType: string): Promise<string> {
    const systemPrompt = `You are a creative writing assistant specializing in ${contentType}. Generate high-quality, engaging content based on the user's request.`;

    const response = await this.client.chat.completions.create({
      model: "grok-3-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "";
  }

  async solveComplexProblem(problem: string, domain?: string): Promise<{
    solution: string;
    steps: string[];
    reasoning: string;
  }> {
    const systemPrompt = domain 
      ? `You are an expert problem solver in ${domain}. Break down complex problems into clear steps and provide detailed solutions.`
      : "You are an expert problem solver. Break down complex problems into clear steps and provide detailed solutions.";

    const response = await this.client.chat.completions.create({
      model: "grok-3-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Please solve this problem step by step: ${problem}\n\nProvide your response in JSON format with 'solution', 'steps' (array), and 'reasoning' fields.`
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        solution: result.solution || "No solution provided",
        steps: Array.isArray(result.steps) ? result.steps : [],
        reasoning: result.reasoning || "No reasoning provided",
      };
    } catch (error) {
      return {
        solution: response.choices[0].message.content || "Unable to parse solution",
        steps: [],
        reasoning: "Raw response provided due to parsing error",
      };
    }
  }

  async codeAnalysis(code: string, language: string): Promise<{
    quality: number;
    suggestions: string[];
    bugs: string[];
    improvements: string[];
  }> {
    const response = await this.client.chat.completions.create({
      model: "grok-3-latest",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer. Analyze the provided ${language} code for quality, bugs, and improvements. Respond in JSON format with 'quality' (1-10), 'suggestions', 'bugs', and 'improvements' arrays.`,
        },
        {
          role: "user",
          content: `Analyze this ${language} code:\n\n${code}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        quality: Math.max(1, Math.min(10, result.quality || 5)),
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        bugs: Array.isArray(result.bugs) ? result.bugs : [],
        improvements: Array.isArray(result.improvements) ? result.improvements : [],
      };
    } catch (error) {
      throw new Error("Failed to analyze code: " + error.message);
    }
  }

  async multiModalAnalysis(text: string, imageBase64?: string): Promise<{
    textAnalysis: string;
    imageAnalysis?: string;
    combinedInsights: string;
  }> {
    // For now, handle text analysis (image analysis would require grok-vision model)
    const textResponse = await this.client.chat.completions.create({
      model: "grok-3-latest",
      messages: [
        {
          role: "system",
          content: "Analyze the provided text for key themes, sentiment, and insights.",
        },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });

    const result = {
      textAnalysis: textResponse.choices[0].message.content || "",
      combinedInsights: `Text analysis: ${textResponse.choices[0].message.content}`,
    };

    if (imageBase64) {
      // This would require grok-2-vision model support
      result.imageAnalysis = "Image analysis requires grok-vision model integration";
      result.combinedInsights += "\n\nImage analysis capability available with vision models.";
    }

    return result;
  }

  async *streamResponse(prompt: string, systemPrompt?: string): AsyncGenerator<string> {
    const messages = systemPrompt 
      ? [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ]
      : [{ role: "user", content: prompt }];

    const stream = await this.client.chat.completions.create({
      model: "grok-3-latest",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }
}

export const enhancedGrokService = new EnhancedGrokService();