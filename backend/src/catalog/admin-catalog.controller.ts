import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { CategoryDto, StoreDto } from '@imora/shared-types';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { StoresService } from './stores/stores.service';
import { CategoriesService } from './categories/categories.service';
import { ListStoresQueryDto } from './stores/dto/list-stores.query.dto';
import { UpdateStoreStatusDto } from './stores/dto/update-store-status.dto';
import { CreateCategoryDto } from './categories/dto/create-category.dto';
import { UpdateCategoryDto } from './categories/dto/update-category.dto';

/**
 * Admin actions that touch catalog-owned entities (Store, Category). The
 * broader "admin panel" feature is Jo'shqin's in stage 1 (IMORA_TZ §7); these
 * two endpoints exist here because only catalog may write those entities
 * (§5.2 — one owner per entity).
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCatalogController {
  constructor(
    private readonly stores: StoresService,
    private readonly categories: CategoriesService,
  ) {}

  @Get('stores')
  listStores(@Query() query: ListStoresQueryDto): Promise<StoreDto[]> {
    return this.stores.listAll(query.status);
  }

  @Patch('stores/:id/status')
  setStoreStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreStatusDto,
  ): Promise<StoreDto> {
    return this.stores.setStatus(id, dto.status);
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categories.create(dto);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categories.update(id, dto);
  }
}
