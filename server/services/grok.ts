import OpenAI from "openai";
import type { ChatCompletionRequest } from "@shared/schema";

export class GrokService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: apiKey || process.env.XAI_API_KEY || "",
    });
  }

  async createChatCompletion(request: ChatCompletionRequest, messages: Array<{role: string, content: string}>) {
    const systemMessages = request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : [];
    
    const allMessages = [
      ...systemMessages,
      ...messages.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }))
    ] as any;

    const response = await this.client.chat.completions.create({
      model: request.model || "grok-3-latest",
      messages: allMessages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 4000,
      stream: request.stream || false,
    });

    return response;
  }

  async *createStreamingCompletion(request: ChatCompletionRequest, messages: Array<{role: string, content: string}>) {
    const systemMessages = request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : [];
    
    const allMessages = [
      ...systemMessages,
      ...messages.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }))
    ] as any;

    const stream = await this.client.chat.completions.create({
      model: request.model || "grok-3-latest",
      messages: allMessages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 4000,
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

export const grokService = new GrokService();
