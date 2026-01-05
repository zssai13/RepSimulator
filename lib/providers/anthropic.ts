// ============================================
// ANTHROPIC (CLAUDE) PROVIDER
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ChatRequest, ChatResponse } from './types';

export class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    return this.client;
  }

  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const client = this.getClient();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: request.maxTokens || 1024,
      system: request.systemPrompt,
      messages: request.messages,
    });

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}

export const anthropicProvider = new AnthropicProvider();
