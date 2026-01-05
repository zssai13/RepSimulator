// ============================================
// XAI (GROK) PROVIDER
// ============================================
// Uses OpenAI SDK with x.ai base URL
// API docs: https://docs.x.ai
// ============================================

import OpenAI from 'openai';
import { LLMProvider, ChatRequest, ChatResponse } from './types';

export class XAIProvider implements LLMProvider {
  name = 'xai';
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      });
    }
    return this.client;
  }

  isConfigured(): boolean {
    return !!process.env.XAI_API_KEY;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const client = this.getClient();

    const response = await client.chat.completions.create({
      model: 'grok-3-fast',
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature || 0.7,
      messages: [
        { role: 'system', content: request.systemPrompt },
        ...request.messages,
      ],
    });

    const content = response.choices[0]?.message?.content || '';

    return {
      content,
      usage: response.usage
        ? {
            inputTokens: response.usage.prompt_tokens,
            outputTokens: response.usage.completion_tokens,
          }
        : undefined,
    };
  }
}

export const xaiProvider = new XAIProvider();
