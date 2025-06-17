// NEVER hardcode secrets in code
import { OpenAI } from "openai";

// Initialize OpenAI client with environment variable
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for security
});

// Enhanced Grok interaction service
export async function askGrok(prompt: string, options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}) {
  try {
    const {
      model = "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature = 0.7,
      maxTokens = 4096,
      systemPrompt
    } = options || {};

    const messages: any[] = [];
    
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    messages.push({ role: "user", content: prompt });

    const chat = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return chat.choices[0]?.message?.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get response from AI model');
  }
}

// Advanced multi-modal analysis
export async function analyzeImageWithText(
  imageBase64: string, 
  textPrompt: string,
  options?: { model?: string }
) {
  try {
    const { model = "gpt-4o" } = options || {};

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: textPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content;
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error('Failed to analyze image');
  }
}

// Structured data analysis with JSON output
export async function getStructuredResponse<T>(
  prompt: string,
  schema: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<T> {
  try {
    const { model = "gpt-4o", temperature = 0.3 } = options || {};

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are a data analysis expert. Respond only with valid JSON matching this schema: ${schema}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response received');

    return JSON.parse(content) as T;
  } catch (error) {
    console.error('Structured response error:', error);
    throw new Error('Failed to get structured response');
  }
}

// Code analysis and improvement
export async function analyzeCode(
  code: string,
  language: string,
  analysisType: 'security' | 'performance' | 'quality' | 'bugs'
) {
  const systemPrompts = {
    security: 'You are a cybersecurity expert. Analyze code for vulnerabilities, security flaws, and potential exploits.',
    performance: 'You are a performance optimization expert. Identify bottlenecks, inefficiencies, and optimization opportunities.',
    quality: 'You are a code quality expert. Evaluate maintainability, readability, best practices, and design patterns.',
    bugs: 'You are a debugging expert. Find potential bugs, logical errors, and edge cases.'
  };

  const prompt = `Analyze this ${language} code for ${analysisType}:

\`\`\`${language}
${code}
\`\`\`

Provide detailed analysis with specific recommendations.`;

  return await askGrok(prompt, {
    systemPrompt: systemPrompts[analysisType],
    temperature: 0.3
  });
}

// Business document generation
export async function generateBusinessDocument(
  documentType: 'proposal' | 'report' | 'email' | 'contract',
  context: Record<string, any>,
  requirements?: string
) {
  const systemPrompt = `You are a professional business writer specializing in ${documentType}s. 
Create well-structured, professional documents that meet industry standards.`;

  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `Create a professional ${documentType} with the following context:

${contextStr}

${requirements ? `Additional requirements: ${requirements}` : ''}

Format the document professionally with appropriate sections and structure.`;

  return await askGrok(prompt, {
    systemPrompt,
    temperature: 0.7
  });
}

// Creative content generation
export async function generateCreativeContent(
  contentType: 'story' | 'article' | 'marketing' | 'social',
  topic: string,
  tone: 'professional' | 'casual' | 'technical' | 'creative',
  length: 'short' | 'medium' | 'long'
) {
  const lengthGuide = {
    short: '150-300 words',
    medium: '300-600 words',
    long: '600-1200 words'
  };

  const systemPrompt = `You are a skilled content creator. Write engaging ${contentType} content 
in a ${tone} tone. Target length: ${lengthGuide[length]}.`;

  const prompt = `Create ${contentType} content about: ${topic}
  
Make it engaging, well-structured, and appropriate for the ${tone} tone.`;

  return await askGrok(prompt, {
    systemPrompt,
    temperature: 0.8
  });
}

// Sentiment analysis
export async function analyzeSentiment(text: string) {
  try {
    const response = await getStructuredResponse<{
      sentiment: 'positive' | 'negative' | 'neutral';
      confidence: number;
      emotions: string[];
      summary: string;
    }>(
      `Analyze the sentiment of this text: "${text}"`,
      `{
        "sentiment": "positive|negative|neutral",
        "confidence": "number between 0 and 1",
        "emotions": ["array of detected emotions"],
        "summary": "brief explanation"
      }`
    );

    return response;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw new Error('Failed to analyze sentiment');
  }
}

// Text summarization
export async function summarizeText(
  text: string,
  options?: {
    length?: 'brief' | 'medium' | 'detailed';
    focus?: string;
  }
) {
  const { length = 'medium', focus } = options || {};
  
  const lengthGuide = {
    brief: '1-2 sentences',
    medium: '1-2 paragraphs',
    detailed: '3-4 paragraphs'
  };

  const focusInstruction = focus ? `Focus specifically on: ${focus}` : '';

  const prompt = `Summarize this text in ${lengthGuide[length]}:

${text}

${focusInstruction}

Provide a clear, concise summary that captures the key points.`;

  return await askGrok(prompt, {
    temperature: 0.3
  });
}

// Language translation
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
) {
  const sourceInfo = sourceLanguage ? `from ${sourceLanguage}` : '';
  
  const prompt = `Translate this text ${sourceInfo} to ${targetLanguage}:

"${text}"

Provide only the translation, maintaining the original tone and meaning.`;

  return await askGrok(prompt, {
    temperature: 0.3
  });
}

// Question answering with context
export async function answerQuestion(
  question: string,
  context?: string,
  options?: {
    detailed?: boolean;
    sources?: boolean;
  }
) {
  const { detailed = false, sources = false } = options || {};
  
  const systemPrompt = `You are a knowledgeable assistant. Provide accurate, helpful answers. 
${detailed ? 'Give detailed explanations.' : 'Be concise but complete.'} 
${sources ? 'Include relevant sources when possible.' : ''}`;

  const contextInfo = context ? `Context: ${context}\n\n` : '';
  
  const prompt = `${contextInfo}Question: ${question}`;

  return await askGrok(prompt, {
    systemPrompt,
    temperature: 0.5
  });
}

// Export all functions for easy import
export const OpenAIService = {
  askGrok,
  analyzeImageWithText,
  getStructuredResponse,
  analyzeCode,
  generateBusinessDocument,
  generateCreativeContent,
  analyzeSentiment,
  summarizeText,
  translateText,
  answerQuestion
};