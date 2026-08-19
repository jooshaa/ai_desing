import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DesignMaterialDto, DesignRequestDto, DesignVariantDto } from '@imora/shared-types';
import { DesignRequest } from './requests/design-request.entity';
import { DesignVariant } from './variants/design-variant.entity';
import { DesignMaterial } from './materials/design-material.entity';
import { DESIGN_STYLES, type DesignStyle } from './prompts/styles';
import { AiDesignProvider } from './providers/ai-provider';
import { estimateRequestCostUsd } from './providers/estimate-cost';
import { QuotaService } from './quota/quota.service';
import { DesignJobQueue } from './queue/design-queue';
import { DesignGenerationService } from './design-generation.service';
import { DesignStorageService } from './storage/design-storage.service';
import { CreateDesignRequestDto } from './dto/create-design-request.dto';

export const ACCEPTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export interface UploadedImage {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface DesignQuotaDto {
  remainingUserRequests: number | null;
  remainingGlobalRequests: number | null;
  remainingBudgetUsd: number | null;
  estimatedCostUsd: number;
  provider: string;
  model: string;
}

@Injectable()
export class DesignService {
  constructor(
    @InjectRepository(DesignRequest)
    private readonly requests: Repository<DesignRequest>,
    @InjectRepository(DesignVariant)
    private readonly variants: Repository<DesignVariant>,
    @InjectRepository(DesignMaterial)
    private readonly materials: Repository<DesignMaterial>,
    private readonly provider: AiDesignProvider,
    private readonly storage: DesignStorageService,
    private readonly quota: QuotaService,
    private readonly queue: DesignJobQueue,
    private readonly generation: DesignGenerationService,
  ) {}

  listStyles(): DesignStyle[] {
    return [...DESIGN_STYLES];
  }

  /**
   * Accepts a room photo and schedules generation (AC-08).
   *
   * Order matters: validate, then check quota, then store, then insert, then
   * enqueue. Checking quota before writing anything means a blocked request
   * leaves no orphan file or row, and enqueuing last means a job can never
   * reference a request that is not committed yet.
   */
  async createRequest(
    userId: string,
    image: UploadedImage,
    dto: CreateDesignRequestDto,
  ): Promise<DesignRequestDto> {
    this.assertUsableImage(image);

    const estimatedCostUsd = this.estimatedCostUsd();
    const decision = await this.quota.check(userId, estimatedCostUsd);
    if (!decision.allowed) {
      // 402 per contracts/design.openapi.yaml — the frontend distinguishes
      // "out of quota" from a generic 4xx to show a come-back-tomorrow message.
      throw new HttpException(
        decision.message ?? 'AI design quota exhausted',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const saved = await this.storage.save(
      { buffer: image.buffer, mimeType: image.mimeType },
      'inputs',
    );

    const request = await this.requests.save(
      this.requests.create({
        userId,
        inputImageUrl: saved.url,
        roomType: dto.roomType ?? null,
        style: dto.style,
        note: dto.note ?? null,
        status: 'queued',
        // Booked up front so concurrent requests cannot each see a full budget
        // and collectively overspend it; corrected to actual on completion.
        apiCost: estimatedCostUsd.toFixed(4),
        provider: this.provider.id,
        model: this.provider.model,
      }),
    );

    await this.queue.enqueue({ requestId: request.id });
    return this.toDto(request, []);
  }

  async getRequestForUser(userId: string, id: string): Promise<DesignRequestDto> {
    const request = await this.requests.findOne({ where: { id } });
    // Same 404 for "missing" and "belongs to someone else" — an existence
    // oracle over other design ids is not worth the nicer error message.
    if (!request || request.userId !== userId) {
      throw new NotFoundException(`Design request ${id} not found`);
    }

    const variants = await this.variants.find({
      where: { requestId: request.id },
      order: { sort: 'ASC' },
    });
    return this.toDto(request, variants);
  }

  async listRequestsForUser(userId: string, limit = 20): Promise<DesignRequestDto[]> {
    const requests = await this.requests.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 50),
    });

    return Promise.all(
      requests.map(async (request) =>
        this.toDto(
          request,
          await this.variants.find({ where: { requestId: request.id }, order: { sort: 'ASC' } }),
        ),
      ),
    );
  }

  async listMaterialsForVariant(variantId: string): Promise<DesignMaterialDto[]> {
    const variant = await this.variants.findOne({ where: { id: variantId } });
    if (!variant) {
      throw new NotFoundException(`Design variant ${variantId} not found`);
    }

    const rows = await this.materials.find({ where: { variantId } });
    return rows.map((row) => ({
      id: row.id,
      variantId: row.variantId,
      tag: row.tag,
      label: row.label,
    }));
  }

  /** Lets the UI show remaining free generations before the user uploads (AC-11). */
  async getQuota(userId: string): Promise<DesignQuotaDto> {
    const estimatedCostUsd = this.estimatedCostUsd();
    const decision = await this.quota.check(userId, estimatedCostUsd);
    const finite = (value: number): number | null => (Number.isFinite(value) ? value : null);

    return {
      remainingUserRequests: finite(decision.remainingUserRequests),
      remainingGlobalRequests: finite(decision.remainingGlobalRequests),
      remainingBudgetUsd: finite(decision.remainingBudgetUsd),
      estimatedCostUsd,
      provider: this.provider.id,
      model: this.provider.model,
    };
  }

  private estimatedCostUsd(): number {
    return estimateRequestCostUsd(this.provider.pricePerImageUsd, this.generation.variantCount);
  }

  private assertUsableImage(image: UploadedImage | undefined): void {
    if (!image || image.size === 0) {
      throw new BadRequestException('A room photo is required');
    }
    if (!ACCEPTED_IMAGE_MIME_TYPES.has(image.mimeType)) {
      throw new BadRequestException(
        `Unsupported image type: ${image.mimeType}. Use JPEG, PNG or WebP.`,
      );
    }
    if (image.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image is larger than 10 MB');
    }
  }

  private toDto(request: DesignRequest, variants: DesignVariant[]): DesignRequestDto {
    return {
      id: request.id,
      userId: request.userId,
      inputImageUrl: request.inputImageUrl,
      roomType: request.roomType,
      style: request.style,
      note: request.note,
      status: request.status,
      apiCost: Number(request.apiCost),
      variants: variants.map((variant): DesignVariantDto => ({
        id: variant.id,
        imageUrl: variant.imageUrl,
        sort: variant.sort,
      })),
      createdAt: request.createdAt.toISOString(),
    };
  }
}
