import { Injectable } from '@nestjs/common';
import type { ProductDto, ProductPriceDto, StoreDto } from '@imora/shared-types';
import { ProductsService } from './products/products.service';
import { StoresService } from './stores/stores.service';
import { TagsService } from './tags/tags.service';

/**
 * The only door other modules use to reach catalog data (IMORA_TZ §5.2 —
 * "boshqa modul entity'ga faqat ID orqali va egasining servisi orqali
 * murojaat qiladi"). CategoriesService/ProductsService/StoresService/
 * TagsService stay private to this module; only this facade is exported.
 *
 * Expected consumers:
 * - orders (module 3): getProductById, getCurrentPrice, getStore — cart/order
 *   totals and price-compare "offers".
 * - design (module 4): findProductIdsByTag — matching DesignMaterial.tag to
 *   catalog products is module 3's job per §6, but the read goes through here.
 */
@Injectable()
export class CatalogService {
  constructor(
    private readonly products: ProductsService,
    private readonly stores: StoresService,
    private readonly tags: TagsService,
  ) {}

  getProductById(id: string): Promise<ProductDto> {
    return this.products.getByIdOrFail(id);
  }

  async getCurrentPrice(productId: string): Promise<ProductPriceDto | null> {
    const price = await this.products.getCurrentPrice(productId);
    if (!price) {
      return null;
    }
    return {
      id: price.id,
      price: Number(price.price),
      currency: price.currency,
      validFrom: price.validFrom.toISOString(),
      inStock: price.inStock,
    };
  }

  async getStore(storeId: string): Promise<StoreDto> {
    const store = await this.stores.findByIdOrFail(storeId);
    return {
      id: store.id,
      name: store.name,
      ownerUserId: store.ownerUserId,
      phone: store.phone,
      region: store.region,
      districts: store.districts,
      status: store.status,
      logoUrl: store.logoUrl,
    };
  }

  findProductIdsByTag(tag: string): Promise<string[]> {
    return this.tags.findProductIdsByTag(tag);
  }
}
