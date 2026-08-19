import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiDesignProvider,
  AiProviderError,
  type GenerateVariantInput,
  type GeneratedVariant,
} from './ai-provider';
import { PRICE_PER_IMAGE_USD, type PricedModel } from './estimate-cost';
import { providerFetch } from './http';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash-image';

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
}

/**
 * Google Gemini image models. Recommended production adapter as of 2026-08-18:
 * strongest instruction-following on "keep the architecture, change the
 * finishes" edits at $0.039/image, which is the cheapest of the adapters that
 * actually preserve room structure.
 *
 * Caveat the team must budget for: Gemini image models have **no free tier**,
 * so this adapter starts costing money from the first call.
 */
@Injectable()
export class GeminiDesignProvider extends AiDesignProvider {
  readonly id = 'gemini';
  readonly model: string;
  readonly pricePerImageUsd: number;
  readonly preservesRoomStructure = true;

  private readonly apiKey: string;

  constructor(config: ConfigService) {
    super();
    this.model = config.get<string>('AI_MODEL', DEFAULT_MODEL);
    this.apiKey = config.get<string>('AI_API_KEY', '');
    this.pricePerImageUsd =
      PRICE_PER_IMAGE_USD[this.model as PricedModel] ?? PRICE_PER_IMAGE_USD[DEFAULT_MODEL];
  }

  async generate(input: GenerateVariantInput): Promise<GeneratedVariant> {
    if (!this.apiKey) {
      throw new AiProviderError('AI_API_KEY is not set', this.id, false);
    }

    const response = await providerFetch(this.id, `${ENDPOINT}/${this.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${input.prompt} Avoid: ${input.negativePrompt}.` },
              {
                inline_data: {
                  mime_type: input.image.mimeType,
                  data: input.image.buffer.toString('base64'),
                },
              },
            ],
          },
        ],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    });

    const body = (await response.json()) as GeminiResponse;
    const parts = body.candidates?.[0]?.content?.parts ?? [];

    const imagePart = parts.find((part) => part.inlineData?.data ?? part.inline_data?.data);
    const data = imagePart?.inlineData?.data ?? imagePart?.inline_data?.data;
    if (!data) {
      // A safety block or a text-only answer lands here. Not retryable: the
      // same prompt on the same photo will be refused again.
      throw new AiProviderError('Gemini returned no image part', this.id, false);
    }

    return {
      buffer: Buffer.from(data, 'base64'),
      mimeType: imagePart?.inlineData?.mimeType ?? imagePart?.inline_data?.mime_type ?? 'image/png',
      materialHints: parts
        .map((part) => part.text)
        .filter((text): text is string => Boolean(text && text.trim())),
    };
  }
}
