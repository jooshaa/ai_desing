import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiDesignProvider,
  AiProviderError,
  type GenerateVariantInput,
  type GeneratedVariant,
} from './ai-provider';
import { PRICE_PER_IMAGE_USD } from './estimate-cost';
import { providerFetch, toDataUri } from './http';

const ENDPOINT = 'https://fal.run/fal-ai/flux-pro/kontext';

interface FalResponse {
  images?: Array<{ url?: string; content_type?: string }>;
}

/**
 * fal.ai running FLUX.1 Kontext Pro. Kontext is an *editing* model — it takes
 * the room photo as a first-class input rather than as a weak img2img hint, so
 * it holds wall and window geometry better than anything else tested.
 *
 * Practical reason it is the adapter to start with: fal grants signup credit,
 * so the first few hundred real generations cost nothing out of pocket, which
 * is what the team needs before there is any budget.
 */
@Injectable()
export class FalDesignProvider extends AiDesignProvider {
  readonly id = 'fal';
  readonly model = 'fal-flux-kontext-pro';
  readonly pricePerImageUsd = PRICE_PER_IMAGE_USD['fal-flux-kontext-pro'];
  readonly preservesRoomStructure = true;

  private readonly apiKey: string;

  constructor(config: ConfigService) {
    super();
    this.apiKey = config.get<string>('AI_API_KEY', '');
  }

  async generate(input: GenerateVariantInput): Promise<GeneratedVariant> {
    if (!this.apiKey) {
      throw new AiProviderError('AI_API_KEY is not set', this.id, false);
    }

    const response = await providerFetch(this.id, ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Key ${this.apiKey}` },
      body: JSON.stringify({
        prompt: input.prompt,
        image_url: toDataUri(input.image.buffer, input.image.mimeType),
        num_images: 1,
        output_format: 'jpeg',
        // Distinct seed per variant, stable across retries of the same variant.
        seed: 1000 + input.variantIndex,
      }),
    });

    const body = (await response.json()) as FalResponse;
    const url = body.images?.[0]?.url;
    if (!url) {
      throw new AiProviderError('fal returned no image', this.id, false);
    }

    // fal hands back a CDN link rather than bytes; we re-host it ourselves so
    // a design does not break when their temporary URL expires.
    const imageResponse = await providerFetch(this.id, url, { method: 'GET' });
    return {
      buffer: Buffer.from(await imageResponse.arrayBuffer()),
      mimeType: body.images?.[0]?.content_type ?? 'image/jpeg',
      materialHints: [],
    };
  }
}
