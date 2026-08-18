import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { ImportResultDto, ProductDto, StoreDto } from '@imora/shared-types';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './auth/authenticated-request';
import { StoresService } from './stores/stores.service';
import { ProductsService } from './products/products.service';
import { TagsService } from './tags/tags.service';
import { ImportService } from './import/import.service';
import { StorageService } from './storage/storage.service';
import { RegisterStoreDto } from './stores/dto/register-store.dto';
import { UpdateStoreDto } from './stores/dto/update-store.dto';
import { CreateProductDto } from './products/dto/create-product.dto';
import { UpdateProductDto } from './products/dto/update-product.dto';
import { ListProductsQueryDto } from './products/dto/list-products.query.dto';
import { UpdatePriceDto } from './prices/dto/update-price.dto';
import { SetTagsDto } from './tags/dto/set-tags.dto';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const IMPORT_MIME_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

/**
 * Everything a store owner manages themselves. Scoping is by ownership
 * (Store.ownerUserId === current user), not by JWT role claim — see
 * `authenticated-request.ts` for why. All routes require core's JwtAuthGuard,
 * which currently throws until core lands (IMORA_TZ §7, 0-bosqich).
 */
@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreCatalogController {
  constructor(
    private readonly stores: StoresService,
    private readonly products: ProductsService,
    private readonly tags: TagsService,
    private readonly importService: ImportService,
    private readonly storage: StorageService,
  ) {}

  @Post('register')
  register(@Req() req: AuthenticatedRequest, @Body() dto: RegisterStoreDto): Promise<StoreDto> {
    return this.stores.registerForUser(req.user.id, dto);
  }

  @Get('me')
  me(@Req() req: AuthenticatedRequest): Promise<StoreDto> {
    return this.stores.getOwn(req.user.id);
  }

  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateStoreDto): Promise<StoreDto> {
    return this.stores.updateOwn(req.user.id, dto);
  }

  @Get('products')
  async listProducts(@Req() req: AuthenticatedRequest, @Query() query: ListProductsQueryDto) {
    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    return this.products.listForStore(store.id, query);
  }

  @Post('products')
  async createProduct(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProductDto,
  ): Promise<ProductDto> {
    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    return this.products.createForStore(store.id, dto);
  }

  @Patch('products/:id')
  async updateProduct(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDto> {
    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    return this.products.updateForStore(store.id, id, dto);
  }

  @Delete('products/:id')
  @HttpCode(204)
  async deleteProduct(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    await this.products.softDeleteForStore(store.id, id);
  }

  @Patch('products/:id/price')
  async updatePrice(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriceDto,
  ): Promise<ProductDto> {
    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    return this.products.updatePriceForStore(store.id, id, dto);
  }

  @Put('products/:id/tags')
  async setTags(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetTagsDto,
  ): Promise<{ tags: string[] }> {
    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    const savedTags = await this.products.setTagsForStore(store.id, id, dto.tags);
    return { tags: savedTags };
  }

  @Post('products/:id/images')
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('images', 5, { limits: { fileSize: MAX_IMAGE_BYTES } }))
  async uploadImages(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<ProductDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    for (const file of files) {
      if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
        throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
      }
    }

    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    await this.products.assertOwnedOrFail(store.id, id);

    const urls: string[] = [];
    for (const file of files) {
      const url = await this.storage.upload(
        { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype },
        store.id,
      );
      urls.push(url);
    }

    return this.products.attachImages(store.id, id, urls);
  }

  @Post('products/import')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMPORT_BYTES } }))
  async importProducts(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const looksLikeSpreadsheet = /\.(csv|xlsx)$/i.test(file.originalname);
    if (!IMPORT_MIME_TYPES.has(file.mimetype) && !looksLikeSpreadsheet) {
      throw new BadRequestException('Only .csv or .xlsx files are supported');
    }

    const store = await this.stores.getOwnEntityOrFail(req.user.id);
    return this.importService.importForStore(store.id, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });
  }
}
