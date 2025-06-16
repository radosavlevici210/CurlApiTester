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
    ];

    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: allMessages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: request.stream,
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
    ];

    const stream = await this.client.chat.completions.create({
      model: request.model,
      messages: allMessages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
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
