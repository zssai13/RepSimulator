// ============================================
// AGENT CONFIGURATION
// ============================================
// This file contains model settings and parameters.
// Edit these values to tune agent behavior.
// ============================================

import { ProviderType } from '@/lib/providers/types';

// Default provider and model
export const DEFAULT_PROVIDER: ProviderType = 'anthropic';
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export const agentConfig = {
  // Default provider (anthropic or xai)
  provider: DEFAULT_PROVIDER,

  // The model to use for generating responses
  model: DEFAULT_MODEL,

  // Maximum tokens in the response
  maxTokens: 1024,

  // Temperature controls randomness (0 = deterministic, 1 = creative)
  // Lower values make responses more focused and predictable
  temperature: 0.7,
} as const;

// Type export for use elsewhere
export type AgentConfig = typeof agentConfig;
