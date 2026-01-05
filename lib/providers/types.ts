// ============================================
// LLM PROVIDER TYPES
// ============================================
// Interface definitions for LLM providers
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  isConfigured(): boolean;
}

// Available providers
export type ProviderType = 'anthropic' | 'xai';

// Model definitions
export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description?: string;
}

// Available models per provider
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Balanced performance and speed',
  },
  {
    id: 'grok-4-1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'xai',
    description: 'Fast reasoning model',
  },
];

// Get models for a specific provider
export const getModelsForProvider = (provider: ProviderType): ModelOption[] => {
  return AVAILABLE_MODELS.filter((m) => m.provider === provider);
};

// Get model by ID
export const getModelById = (id: string): ModelOption | undefined => {
  return AVAILABLE_MODELS.find((m) => m.id === id);
};
