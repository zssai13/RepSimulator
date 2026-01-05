import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS, getConfiguredProviders } from '@/lib/providers';

/**
 * GET /api/models
 * Returns available models based on configured providers
 */
export async function GET() {
  const configuredProviders = getConfiguredProviders();

  // Filter models to only show those with configured providers
  const availableModels = AVAILABLE_MODELS.filter((model) =>
    configuredProviders.includes(model.provider)
  );

  return NextResponse.json({
    models: availableModels,
    configuredProviders,
  });
}
