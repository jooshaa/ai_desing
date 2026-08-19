import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiDesignProvider,
  AiProviderError,
  type GenerateVariantInput,
  type GeneratedVariant,
} from './ai-provider';
import { PRICE_PER_IMAGE_USD } from './estimate-cost';
import { providerFetch } from './http';

const MODEL_PATH = '@cf/black-forest-labs/flux-1-schnell';

interface CloudflareResponse {
  result?: { image?: string };
  success?: boolean;
  errors?: Array<{ message?: string }>;
}

/**
 * Cloudflare Workers AI. The only adapter with a genuinely free allowance
 * (10,000 Neurons/day, no card), which makes it the right way to smoke-test the
 * pipeline end to end for nothing.
 *
 * Read this before shipping it to users: `flux-1-schnell` is **text-to-image**.
 * It never sees the uploaded room, so `preservesRoomStructure` is false and the
 * output is a generic room in the requested style, not *their* room. Useful for
 * load and plumbing tests; not a product-quality option.
 */
@Injectable()
export class CloudflareDesignProvider extends AiDesignProvider {
  readonly id = 'cloudflare';
  readonly model = 'cloudflare-flux-1-schnell';
  readonly pricePerImageUsd = PRICE_PER_IMAGE_USD['cloudflare-flux-1-schnell'];
  readonly preservesRoomStructure = false;

  private readonly apiKey: string;
  private readonly accountId: string;

  constructor(config: ConfigService) {
    super();
    this.apiKey = config.get<string>('AI_API_KEY', '');
    this.accountId = config.get<string>('AI_CLOUDFLARE_ACCOUNT_ID', '');
  }

  async generate(input: GenerateVariantInput): Promise<GeneratedVariant> {
    if (!this.apiKey || !this.accountId) {
      throw new AiProviderError(
        'AI_API_KEY and AI_CLOUDFLARE_ACCOUNT_ID must both be set',
        this.id,
        false,
      );
    }

    const response = await providerFetch(
      this.id,
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${MODEL_PATH}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({ prompt: input.prompt, steps: 4 }),
      },
    );

    const body = (await response.json()) as CloudflareResponse;
    if (!body.result?.image) {
      const reason = body.errors?.[0]?.message ?? 'no image in response';
      throw new AiProviderError(`Cloudflare returned ${reason}`, this.id, false);
    }

    return {
      buffer: Buffer.from(body.result.image, 'base64'),
      mimeType: 'image/jpeg',
      materialHints: [],
    };
  }
}
