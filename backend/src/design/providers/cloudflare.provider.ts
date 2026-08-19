import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiDesignProvider,
  AiProviderError,
  type GenerateVariantInput,
  type GeneratedVariant,
} from './ai-provider';
import { PRICE_PER_IMAGE_USD, type PricedModel } from './estimate-cost';
import { providerFetch } from './http';
import { KLEIN_MAX_INPUT_EDGE, resizeToFit } from './resize-image';

const DEFAULT_MODEL = 'cloudflare-flux-2-klein-4b';

/** Maps our price-table key to Cloudflare's model path. */
const MODEL_PATHS: Record<string, string> = {
  'cloudflare-flux-2-klein-4b': '@cf/black-forest-labs/flux-2-klein-4b',
  'cloudflare-flux-2-klein-9b': '@cf/black-forest-labs/flux-2-klein-9b',
};

/** klein is distilled: the step count is baked in and cannot be tuned. */
const OUTPUT_WIDTH = 1024;
const OUTPUT_HEIGHT = 768;

interface CloudflareResponse {
  result?: { image?: string };
  image?: string;
  success?: boolean;
  errors?: Array<{ message?: string }>;
}

/**
 * Cloudflare Workers AI running FLUX.2 [klein].
 *
 * The only adapter that is both **free** (10,000 Neurons/day, renewing, no card)
 * and **structure-preserving** — klein unifies generation and editing, so it
 * takes the room photo as a real input rather than ignoring it. At roughly 84
 * neurons per image that is about 120 images, or 40 three-variant requests, per
 * day at no cost, which is what a team with no budget actually needs.
 *
 * The catch, and it is a real one: klein requires every input image to be
 * smaller than 512x512, so the room photo is downscaled before the model sees
 * it. Fine for testing the funnel and the UX; the open question is whether the
 * result is realistic enough to buy materials from, which the critical-analysis
 * doc names as a kill criterion. Answer that on a full-resolution provider.
 */
@Injectable()
export class CloudflareDesignProvider extends AiDesignProvider {
  readonly id = 'cloudflare';
  readonly model: string;
  readonly pricePerImageUsd: number;
  readonly preservesRoomStructure = true;

  private readonly logger = new Logger(CloudflareDesignProvider.name);
  private readonly apiKey: string;
  private readonly accountId: string;

  constructor(config: ConfigService) {
    super();
    const requested = config.get<string>('AI_MODEL', DEFAULT_MODEL);
    this.model = MODEL_PATHS[requested] ? requested : DEFAULT_MODEL;
    this.pricePerImageUsd =
      PRICE_PER_IMAGE_USD[this.model as PricedModel] ?? PRICE_PER_IMAGE_USD[DEFAULT_MODEL];
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

    const source = await resizeToFit(
      input.image.buffer,
      input.image.mimeType,
      KLEIN_MAX_INPUT_EDGE,
    );
    if (source.resized) {
      this.logger.debug(`Downscaled input to ${source.width}x${source.height} for klein`);
    }

    // klein takes multipart form data, not JSON — even for the prompt.
    const form = new FormData();
    form.append('prompt', `${input.prompt} Avoid: ${input.negativePrompt}.`);
    form.append('width', String(OUTPUT_WIDTH));
    form.append('height', String(OUTPUT_HEIGHT));
    form.append(
      'input_image_0',
      new Blob([new Uint8Array(source.buffer)], { type: source.mimeType }),
      'room.jpg',
    );

    const response = await providerFetch(
      this.id,
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${MODEL_PATHS[this.model]}`,
      {
        method: 'POST',
        // No content-type header: fetch must set the multipart boundary itself.
        headers: { authorization: `Bearer ${this.apiKey}` },
        body: form,
      },
    );

    return this.readImage(response);
  }

  /**
   * Workers AI returns either a JSON envelope with base64 or the raw image
   * bytes depending on the model, so both are handled rather than assuming.
   */
  private async readImage(response: Response): Promise<GeneratedVariant> {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.startsWith('image/')) {
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        mimeType: contentType,
        materialHints: [],
      };
    }

    const body = (await response.json()) as CloudflareResponse;
    const base64 = body.result?.image ?? body.image;
    if (!base64) {
      const reason = body.errors?.[0]?.message ?? 'no image in response';
      throw new AiProviderError(`Cloudflare returned ${reason}`, this.id, false);
    }

    return {
      buffer: Buffer.from(base64, 'base64'),
      mimeType: 'image/jpeg',
      materialHints: [],
    };
  }
}
