// ============================================
// LLM UTILITIES
// ============================================
// This file handles all LLM interactions:
// - Building prompts from configuration
// - Calling the Claude API (Step 4)
// - Managing conversation context
// ============================================

import { agentConfig } from '@/config/agent-config';
import { assembleFullPrompt } from '@/config/prompts';
import { Message } from '@/types';

// Type for building prompts
export interface PromptConfig {
  pageContext: string;
  initialMessage: string;
  goal: string;
  knowledgeContext?: string;
}

// Type for chat request
export interface ChatRequest {
  messages: Message[];
  config: PromptConfig;
}

// Type for chat response
export interface ChatResponse {
  content: string;
  error?: string;
}

/**
 * Builds the complete system prompt with all context
 * This is the main function for assembling what the agent knows
 */
export function buildSystemPrompt(config: PromptConfig): string {
  return assembleFullPrompt({
    pageContext: config.pageContext,
    initialMessage: config.initialMessage,
    goal: config.goal,
    knowledgeContext: config.knowledgeContext,
  });
}

/**
 * Formats conversation messages for the Claude API
 * Converts our Message format to Claude's expected format
 */
export function formatMessagesForClaude(
  messages: Message[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((msg) => msg.role !== 'initial') // Initial message is context, not conversation
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
}

/**
 * Gets the current agent configuration
 * Useful for displaying in the UI
 */
export function getAgentConfig() {
  return {
    model: agentConfig.model,
    maxTokens: agentConfig.maxTokens,
    temperature: agentConfig.temperature,
  };
}

/**
 * Placeholder for loading knowledge context
 * Will be implemented in Step 6 (RAG) and Step 7-8 (Playbooks)
 */
export async function loadKnowledgeContext(
  _query: string
): Promise<string | undefined> {
  // TODO: Step 6 - Query LanceDB for relevant website/docs chunks
  // TODO: Step 7-8 - Load extracted playbooks from ./data/playbooks/
  return undefined;
}

/**
 * Debug helper: Get the full prompt that would be sent
 * Useful for the prompt viewer in the UI
 */
export function debugGetFullPrompt(config: PromptConfig): {
  systemPrompt: string;
  agentConfig: typeof agentConfig;
} {
  return {
    systemPrompt: buildSystemPrompt(config),
    agentConfig: { ...agentConfig },
  };
}

