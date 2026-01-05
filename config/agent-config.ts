// ============================================
// AGENT CONFIGURATION
// ============================================
// This file contains model settings and parameters.
// Edit these values to tune agent behavior.
// ============================================

export const agentConfig = {
  // The Claude model to use for generating responses
  model: "claude-sonnet-4-20250514",
  
  // Maximum tokens in the response
  maxTokens: 1024,
  
  // Temperature controls randomness (0 = deterministic, 1 = creative)
  // Lower values make responses more focused and predictable
  temperature: 0.7,
} as const;

// Type export for use elsewhere
export type AgentConfig = typeof agentConfig;

