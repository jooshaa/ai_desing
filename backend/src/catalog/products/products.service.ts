import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import type { ProductDto, ProductPageDto, ProductPriceDto } from '@imora/shared-types';
import { Product } from './product.entity';
import { ProductPrice } from '../prices/product-price.entity';
import { Store } from '../stores/store.entity';
import { CategoriesService } from '../categories/categories.service';
import { TagsService } from '../tags/tags.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { UpdatePriceDto } from '../prices/dto/update-price.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(ProductPrice)
    private readonly prices: Repository<ProductPrice>,
    private readonly categories: CategoriesService,
    private readonly tags: TagsService,
  ) {}

  async createForStore(storeId: string, dto: CreateProductDto): Promise<ProductDto> {
    await this.categories.findEntityOrFail(dto.categoryId);

    const product = this.products.create({
      storeId,
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description ?? null,
      unit: dto.unit,
      imageUrls: dto.imageUrls ?? [],
      attributes: dto.attributes ?? {},
      isActive: true,
    });
    const savedProduct = await this.products.save(product);
    const savedPrice = await this.insertPrice(
      savedProduct.id,
      dto.price,
      dto.currency,
      dto.inStock,
    );

    return this.toDto(savedProduct, savedPrice);
  }

  async updateForStore(
    storeId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductDto> {
    const product = await this.getOwnedEntityOrFail(storeId, productId);

    if (dto.categoryId !== undefined) {
      await this.categories.findEntityOrFail(dto.categoryId);
      product.categoryId = dto.categoryId;
    }
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.unit !== undefined) product.unit = dto.unit;
    if (dto.imageUrls !== undefined) product.imageUrls = dto.imageUrls;
    if (dto.attributes !== undefined) product.attributes = dto.attributes;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    const saved = await this.products.save(product);
    const price = await this.getCurrentPrice(productId);
    return this.toDto(saved, price ?? undefined);
  }

  async softDeleteForStore(storeId: string, productId: string): Promise<void> {
    const product = await this.getOwnedEntityOrFail(storeId, productId);
    product.isActive = false;
    await this.products.save(product);
  }

  async updatePriceForStore(
    storeId: string,
    productId: string,
    dto: UpdatePriceDto,
  ): Promise<ProductDto> {
    const product = await this.getOwnedEntityOrFail(storeId, productId);
    const saved = await this.insertPrice(productId, dto.price, dto.currency, dto.inStock);
    return this.toDto(product, saved);
  }

  async attachImages(storeId: string, productId: string, urls: string[]): Promise<ProductDto> {
    const product = await this.getOwnedEntityOrFail(storeId, productId);
    product.imageUrls = [...product.imageUrls, ...urls].slice(0, 8);
    const saved = await this.products.save(product);
    const price = await this.getCurrentPrice(productId);
    return this.toDto(saved, price ?? undefined);
  }

  async setTagsForStore(storeId: string, productId: string, tagList: string[]): Promise<string[]> {
    await this.getOwnedEntityOrFail(storeId, productId);
    return this.tags.setForProduct(productId, tagList);
  }

  /** Ownership guard shared with controllers that touch a product before writing it (e.g. image upload). */
  async assertOwnedOrFail(storeId: string, productId: string): Promise<void> {
    await this.getOwnedEntityOrFail(storeId, productId);
  }

  async listForStore(storeId: string, query: ListProductsQueryDto): Promise<ProductPageDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.products
      .createQueryBuilder('product')
      .where('product.storeId = :storeId', { storeId });
    this.applySearch(qb, query);

    const [items, total] = await qb
      .orderBy('product.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return this.toPage(items, total, page, limit);
  }

  /** Public catalog: only products from stores an admin has approved (AC-13). */
  async listPublic(query: ListProductsQueryDto): Promise<ProductPageDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.products
      .createQueryBuilder('product')
      .innerJoin(Store, 'store', 'store.id = product.storeId')
      .where('product.isActive = true')
      .andWhere('store.status = :status', { status: 'active' });
    this.applySearch(qb, query);

    const [items, total] = await qb
      .orderBy('product.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return this.toPage(items, total, page, limit);
  }

  async getPublicByIdOrFail(id: string): Promise<ProductDto> {
    const product = await this.products
      .createQueryBuilder('product')
      .innerJoin(Store, 'store', 'store.id = product.storeId')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = true')
      .andWhere('store.status = :status', { status: 'active' })
      .getOne();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    const price = await this.getCurrentPrice(id);
    return this.toDto(product, price ?? undefined);
  }

  /** Cross-module read (no visibility filter) — for orders/design to resolve a productId they already hold. */
  async getByIdOrFail(id: string): Promise<ProductDto> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    const price = await this.getCurrentPrice(id);
    return this.toDto(product, price ?? undefined);
  }

  async getCurrentPrice(productId: string): Promise<ProductPrice | null> {
    const map = await this.getCurrentPricesByProductIds([productId]);
    return map.get(productId) ?? null;
  }

  private async getCurrentPricesByProductIds(
    productIds: string[],
  ): Promise<Map<string, ProductPrice>> {
    if (productIds.length === 0) {
      return new Map();
    }
    const rows = (await this.prices.query(
      `SELECT DISTINCT ON ("productId") *
       FROM product_prices
       WHERE "productId" = ANY($1) AND "validFrom" <= now()
       ORDER BY "productId", "validFrom" DESC`,
      [productIds],
    )) as ProductPrice[];

    const map = new Map<string, ProductPrice>();
    for (const row of rows) {
      map.set(row.productId, this.prices.create(row));
    }
    return map;
  }

  private async insertPrice(
    productId: string,
    price: number,
    currency: string | undefined,
    inStock: boolean | undefined,
  ): Promise<ProductPrice> {
    const row = this.prices.create({
      productId,
      price: price.toFixed(2),
      currency: currency ?? 'UZS',
      validFrom: new Date(),
      inStock: inStock ?? true,
    });
    return this.prices.save(row);
  }

  private async getOwnedEntityOrFail(storeId: string, productId: string): Promise<Product> {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product || product.storeId !== storeId) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return product;
  }

  private applySearch(qb: SelectQueryBuilder<Product>, query: ListProductsQueryDto): void {
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.q) {
      qb.andWhere('product.name ILIKE :q', { q: `%${query.q}%` });
    }
  }

  private async toPage(
    products: Product[],
    total: number,
    page: number,
    limit: number,
  ): Promise<ProductPageDto> {
    const prices = await this.getCurrentPricesByProductIds(products.map((p) => p.id));
    return {
      items: products.map((p) => this.toDto(p, prices.get(p.id))),
      total,
      page,
      limit,
    };
  }

  private toDto(product: Product, price?: ProductPrice): ProductDto {
    return {
      id: product.id,
      storeId: product.storeId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      unit: product.unit,
      imageUrls: product.imageUrls,
      attributes: product.attributes,
      isActive: product.isActive,
      price: price ? this.toPriceDto(price) : undefined,
    };
  }

  private toPriceDto(price: ProductPrice): ProductPriceDto {
    return {
      id: price.id,
      price: Number(price.price),
      currency: price.currency,
      validFrom: price.validFrom.toISOString(),
      inStock: price.inStock,
    };
  }
}
