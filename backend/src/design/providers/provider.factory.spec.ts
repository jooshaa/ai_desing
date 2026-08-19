import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolveAiProvider, SUPPORTED_AI_PROVIDERS } from './provider.factory';
import { PRICE_PER_IMAGE_USD } from './estimate-cost';

function configWith(values: Record<string, string>): ConfigService {
  return {
    get: (key: string, fallback?: unknown): unknown => values[key] ?? fallback,
  } as unknown as ConfigService;
}

describe('resolveAiProvider', () => {
  const silentLogger = { log: jest.fn(), warn: jest.fn() } as unknown as Logger;

  beforeEach(() => jest.clearAllMocks());

  it('defaults to the stub so a fresh clone runs with no AI account', () => {
    expect(resolveAiProvider(configWith({}), silentLogger).id).toBe('stub');
  });

  it('selects each supported provider by name', () => {
    for (const id of SUPPORTED_AI_PROVIDERS) {
      expect(resolveAiProvider(configWith({ AI_PROVIDER: id }), silentLogger).id).toBe(id);
    }
  });

  it('is case and whitespace insensitive', () => {
    expect(resolveAiProvider(configWith({ AI_PROVIDER: '  GeMiNi ' }), silentLogger).id).toBe(
      'gemini',
    );
  });

  it('warns and falls back to the stub on an unknown provider instead of crashing', () => {
    const provider = resolveAiProvider(configWith({ AI_PROVIDER: 'midjourney' }), silentLogger);

    expect(provider.id).toBe('stub');
    expect(silentLogger.warn).toHaveBeenCalled();
  });

  it('prices gemini from the model override when one is given', () => {
    const provider = resolveAiProvider(
      configWith({ AI_PROVIDER: 'gemini', AI_MODEL: 'gemini-3-pro-image' }),
      silentLogger,
    );

    expect(provider.pricePerImageUsd).toBe(PRICE_PER_IMAGE_USD['gemini-3-pro-image']);
  });

  it('marks text-to-image adapters as not structure-preserving', () => {
    expect(
      resolveAiProvider(configWith({ AI_PROVIDER: 'cloudflare' }), silentLogger)
        .preservesRoomStructure,
    ).toBe(false);
    expect(
      resolveAiProvider(configWith({ AI_PROVIDER: 'fal' }), silentLogger).preservesRoomStructure,
    ).toBe(true);
  });
});
