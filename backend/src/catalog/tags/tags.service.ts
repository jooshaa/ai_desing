import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductTag } from './product-tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(ProductTag)
    private readonly tags: Repository<ProductTag>,
  ) {}

  async listForProduct(productId: string): Promise<string[]> {
    const rows = await this.tags.find({ where: { productId } });
    return rows.map((row) => row.tag);
  }

  async setForProduct(productId: string, tags: string[]): Promise<string[]> {
    const unique = [...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))];

    await this.tags.delete({ productId });
    if (unique.length === 0) {
      return [];
    }
    const rows = unique.map((tag) => this.tags.create({ productId, tag }));
    await this.tags.save(rows);
    return unique;
  }

  /**
   * Cross-module read: design's DesignMaterial.tag matches ProductTag.tag to
   * surface catalog products for an AI design result (IMORA_TZ §6, owned by
   * module 3 — search — which calls this via CatalogService).
   */
  async findProductIdsByTag(tag: string): Promise<string[]> {
    const rows = await this.tags.find({ where: { tag } });
    return [...new Set(rows.map((row) => row.productId))];
  }
}
