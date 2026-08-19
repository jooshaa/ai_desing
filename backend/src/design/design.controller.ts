import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { DesignMaterialDto, DesignRequestDto } from '@imora/shared-types';
import { DesignService, MAX_IMAGE_BYTES, type DesignQuotaDto } from './design.service';
import { CreateDesignRequestDto } from './dto/create-design-request.dto';
import { DesignAuthGuard } from './auth/design-auth.guard';
import type { AuthenticatedRequest } from './auth/authenticated-request';
import type { DesignStyle } from './prompts/styles';

/**
 * Implements `contracts/design.openapi.yaml`. Controllers stay HTTP-only per
 * IMORA_TZ §9 — validation lives in the DTO, everything else in the service.
 */
@Controller('design')
export class DesignController {
  constructor(private readonly design: DesignService) {}

  /** Public: the style picker renders before the user signs in. */
  @Get('styles')
  styles(): DesignStyle[] {
    return this.design.listStyles();
  }

  @Get('quota')
  @UseGuards(DesignAuthGuard)
  quota(@Req() req: AuthenticatedRequest): Promise<DesignQuotaDto> {
    return this.design.getQuota(req.user.id);
  }

  @Post('requests')
  @HttpCode(202)
  @UseGuards(DesignAuthGuard)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_BYTES } }))
  createRequest(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() image: Express.Multer.File | undefined,
    @Body() dto: CreateDesignRequestDto,
  ): Promise<DesignRequestDto> {
    return this.design.createRequest(
      req.user.id,
      {
        buffer: image?.buffer ?? Buffer.alloc(0),
        originalName: image?.originalname ?? '',
        mimeType: image?.mimetype ?? '',
        size: image?.size ?? 0,
      },
      dto,
    );
  }

  @Get('requests')
  @UseGuards(DesignAuthGuard)
  listRequests(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ): Promise<DesignRequestDto[]> {
    return this.design.listRequestsForUser(req.user.id, limit ? Number(limit) : undefined);
  }

  @Get('requests/:id')
  @UseGuards(DesignAuthGuard)
  getRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DesignRequestDto> {
    return this.design.getRequestForUser(req.user.id, id);
  }

  /**
   * Public per the contract: module 3 reads these tags to match catalog
   * products, and they carry nothing user-identifying.
   */
  @Get('variants/:id/materials')
  materials(@Param('id', ParseUUIDPipe) id: string): Promise<DesignMaterialDto[]> {
    return this.design.listMaterialsForVariant(id);
  }
}
