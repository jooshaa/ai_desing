import { Logger, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiDesignProvider } from './ai-provider';
import { StubDesignProvider } from './stub.provider';
import { GeminiDesignProvider } from './gemini.provider';
import { FalDesignProvider } from './fal.provider';
import { CloudflareDesignProvider } from './cloudflare.provider';

type ProviderBuilder = (config: ConfigService) => AiDesignProvider;

const BUILDERS: Record<string, ProviderBuilder> = {
  stub: () => new StubDesignProvider(),
  gemini: (config) => new GeminiDesignProvider(config),
  fal: (config) => new FalDesignProvider(config),
  cloudflare: (config) => new CloudflareDesignProvider(config),
};

export const SUPPORTED_AI_PROVIDERS = Object.keys(BUILDERS);

/**
 * Resolves `AI_PROVIDER` to an adapter. An unrecognised value falls back to the
 * stub with a loud warning instead of crashing the process: a typo in one
 * teammate's `.env` should not take the whole API down for them, and the stub
 * keeps every non-AI feature testable (AC-10).
 */
export function resolveAiProvider(
  config: ConfigService,
  logger = new Logger('AiProvider'),
): AiDesignProvider {
  const requested = (config.get<string>('AI_PROVIDER', 'stub') || 'stub').trim().toLowerCase();
  const build = BUILDERS[requested];

  if (!build) {
    logger.warn(
      `AI_PROVIDER="${requested}" is not one of ${SUPPORTED_AI_PROVIDERS.join(', ')} — falling back to the stub provider.`,
    );
    return new StubDesignProvider();
  }

  const provider = build(config);
  logger.log(
    `AI provider: ${provider.id} (model ${provider.model}, $${provider.pricePerImageUsd}/image, structure-preserving: ${provider.preservesRoomStructure})`,
  );
  return provider;
}

export const aiDesignProviderFactory: Provider = {
  provide: AiDesignProvider,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => resolveAiProvider(config),
};
