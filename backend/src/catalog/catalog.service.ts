import { Injectable, NotImplementedException } from '@nestjs/common';
import type { CategoryDto, ProductDto } from '@imora/shared-types';

@Injectable()
export class CatalogService {
  listCategories(): CategoryDto[] {
    throw new NotImplementedException('Category tree not implemented');
  }

  listProducts(_query: { q?: string; categoryId?: string }): ProductDto[] {
    throw new NotImplementedException('Product listing not implemented');
  }
}
