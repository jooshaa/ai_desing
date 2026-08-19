import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { Repository } from 'typeorm';
import { DesignRequest } from './requests/design-request.entity';
import { DesignVariant } from './variants/design-variant.entity';
import { DesignMaterial } from './materials/design-material.entity';
import { AiDesignProvider, type GeneratedVariant } from './providers/ai-provider';
import { estimateRequestCostUsd } from './providers/estimate-cost';
import { buildPrompt } from './prompts/build-prompt';
import { extractMaterials } from './materials/extract-materials';
import { DesignStorageService } from './storage/design-storage.service';

export const DEFAULT_VARIANT_COUNT = 3;

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * Runs one design request end to end. Called by whichever queue driver is
 * active, never by a controller — the HTTP request returns 202 long before this
 * finishes (AC-08 allows 90 seconds).
 */
@Injectable()
export class DesignGenerationService {
  private readonly logger = new Logger(DesignGenerationService.name);

  constructor(
    @InjectRepository(DesignRequest)
    private readonly requests: Repository<DesignRequest>,
    @InjectRepository(DesignVariant)
    private readonly variants: Repository<DesignVariant>,
    @InjectRepository(DesignMaterial)
    private readonly materials: Repository<DesignMaterial>,
    private readonly provider: AiDesignProvider,
    private readonly storage: DesignStorageService,
    private readonly config: ConfigService,
  ) {}

  get variantCount(): number {
    const raw = Number(this.config.get<string>('AI_VARIANT_COUNT', `${DEFAULT_VARIANT_COUNT}`));
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_VARIANT_COUNT;
  }

  async run(requestId: string): Promise<void> {
    const request = await this.requests.findOne({ where: { id: requestId } });
    if (!request) {
      this.logger.warn(`Design request ${requestId} vanished before generation`);
      return;
    }
    if (request.status === 'done') {
      return; // Queue redelivery — generating again would double-charge.
    }

    await this.requests.update(request.id, { status: 'processing' });
    const startedAt = Date.now();

    try {
      const source = await this.readSourceImage(request.inputImageUrl);
      const count = this.variantCount;

      // Variants run in parallel: three sequential 20s calls would blow the
      // 90s budget in AC-08. `allSettled` keeps partial success usable — two
      // good designs beat an error page.
      const results = await Promise.allSettled(
        Array.from({ length: count }, (_, variantIndex) => {
          const { prompt, negativePrompt } = buildPrompt({
            style: request.style,
            roomType: request.roomType,
            note: request.note,
            variantIndex,
          });
          return this.provider.generate({
            image: source,
            prompt,
            negativePrompt,
            variantIndex,
          });
        }),
      );

      const succeeded = results.filter(
        (result): result is PromiseFulfilledResult<GeneratedVariant> =>
          result.status === 'fulfilled',
      );

      if (succeeded.length === 0) {
        const reason = results
          .map((result) => (result.status === 'rejected' ? this.describe(result.reason) : ''))
          .filter(Boolean)[0];
        await this.fail(request, reason ?? 'AI provider returned no images');
        return;
      }

      await this.persistVariants(request, succeeded);

      // Charge only for images we actually got back.
      const actualCost = estimateRequestCostUsd(this.provider.pricePerImageUsd, succeeded.length);
      await this.requests.update(request.id, {
        status: 'done',
        apiCost: actualCost.toFixed(4),
        completedAt: new Date(),
        errorMessage:
          succeeded.length < count
            ? `${count - succeeded.length} of ${count} variants failed`
            : null,
      });

      this.logger.log(
        `Design ${request.id}: ${succeeded.length}/${count} variants via ${this.provider.id} in ${Date.now() - startedAt}ms ($${actualCost})`,
      );
    } catch (error) {
      await this.fail(request, this.describe(error));
    }
  }

  private async persistVariants(
    request: DesignRequest,
    succeeded: PromiseFulfilledResult<GeneratedVariant>[],
  ): Promise<void> {
    for (const [index, result] of succeeded.entries()) {
      const generated = result.value;
      const saved = await this.storage.save(
        { buffer: generated.buffer, mimeType: generated.mimeType },
        request.id,
      );

      const variant = await this.variants.save(
        this.variants.create({ requestId: request.id, imageUrl: saved.url, sort: index }),
      );

      const materials = extractMaterials({
        styleId: request.style,
        roomType: request.roomType,
        hints: generated.materialHints,
      });
      if (materials.length > 0) {
        await this.materials.save(
          materials.map((material) =>
            this.materials.create({
              variantId: variant.id,
              tag: material.tag,
              label: material.label,
            }),
          ),
        );
      }
    }
  }

  /**
   * A failed generation is recorded, not thrown onward: the rest of Imora keeps
   * working when the AI vendor is down, which is the whole of AC-10.
   */
  private async fail(request: DesignRequest, message: string): Promise<void> {
    this.logger.error(`Design ${request.id} failed: ${message}`);
    await this.requests.update(request.id, {
      status: 'failed',
      errorMessage: message.slice(0, 1000),
      completedAt: new Date(),
      apiCost: '0.0000',
    });
  }

  private async readSourceImage(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const path = this.storage.resolveLocalPath(url);
    if (!path) {
      throw new Error(`Input image is not a local design upload: ${url}`);
    }
    return {
      buffer: await readFile(path),
      mimeType: MIME_BY_EXT[extname(path).toLowerCase()] ?? 'image/jpeg',
    };
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown generation error';
  }
}
