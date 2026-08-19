export interface SourceImage {
  buffer: Buffer;
  mimeType: string;
}

export interface GenerateVariantInput {
  image: SourceImage;
  prompt: string;
  negativePrompt: string;
  /** 0-based index of the variant being generated, for providers that seed on it. */
  variantIndex: number;
}

export interface GeneratedVariant {
  buffer: Buffer;
  mimeType: string;
  /**
   * Free-form material phrases the model volunteered ("warm beige wallpaper").
   * Optional: most image endpoints return pixels only. `extractMaterials()`
   * normalises whatever arrives here into catalog tags.
   */
  materialHints: string[];
}

/**
 * One external image model behind a stable interface (IMORA_TZ §2 — "tashqi
 * rasm-generatsiya API, o'z model o'qitilmaydi"). Adapters are swapped by env
 * var, never by editing callers, so switching providers when prices move is a
 * config change rather than a code change.
 */
export abstract class AiDesignProvider {
  /** Value of `AI_PROVIDER` that selects this adapter. */
  abstract readonly id: string;
  /** Concrete model identifier, stored on the request row for cost forensics. */
  abstract readonly model: string;
  /** List price in USD for one generated image. Drives the budget guard. */
  abstract readonly pricePerImageUsd: number;
  /** False for adapters that cannot take a source image (text-to-image only). */
  abstract readonly preservesRoomStructure: boolean;

  abstract generate(input: GenerateVariantInput): Promise<GeneratedVariant>;
}

/** Provider failures are wrapped so the queue can tell them from bugs (AC-10). */
export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'AiProviderError';
  }
}
