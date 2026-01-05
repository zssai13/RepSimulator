// ============================================
// PROVIDER FACTORY
// ============================================
// Central registry for all LLM providers
// ============================================

import { LLMProvider, ProviderType, AVAILABLE_MODELS, ModelOption } from './types';
import { anthropicProvider } from './anthropic';
import { xaiProvider } from './xai';

// Provider registry
const providers: Record<ProviderType, LLMProvider> = {
  anthropic: anthropicProvider,
  xai: xaiProvider,
};

/**
 * Get a provider by type
 */
export function getProvider(type: ProviderType): LLMProvider {
  const provider = providers[type];
  if (!provider) {
    throw new Error(`Unknown provider: ${type}`);
  }
  return provider;
}

/**
 * Get provider for a specific model ID
 */
export function getProviderForModel(modelId: string): LLMProvider {
  const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  return getProvider(model.provider);
}

/**
 * Check which providers are configured (have API keys)
 */
export function getConfiguredProviders(): ProviderType[] {
  return (Object.keys(providers) as ProviderType[]).filter((type) =>
    providers[type].isConfigured()
  );
}

/**
 * Get all available models that have configured providers
 */
export function getAvailableModels(): ModelOption[] {
  const configured = getConfiguredProviders();
  return AVAILABLE_MODELS.filter((m) => configured.includes(m.provider));
}

/**
 * Check if at least one provider is configured
 */
export function hasAnyProvider(): boolean {
  return getConfiguredProviders().length > 0;
}

// Re-export types
export * from './types';
