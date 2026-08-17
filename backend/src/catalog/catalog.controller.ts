import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import type { CategoryDto, ProductDto, ProductPageDto } from '@imora/shared-types';
import { CategoriesService } from './categories/categories.service';
import { ProductsService } from './products/products.service';
import { ListProductsQueryDto } from './products/dto/list-products.query.dto';

@Controller()
export class CatalogController {
  constructor(
    private readonly categories: CategoriesService,
    private readonly products: ProductsService,
  ) {}

  @Get('categories')
  categoryTree(): Promise<CategoryDto[]> {
    return this.categories.getTree();
  }

  @Get('products')
  listProducts(@Query() query: ListProductsQueryDto): Promise<ProductPageDto> {
    return this.products.listPublic(query);
  }

  @Get('products/:id')
  getProduct(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDto> {
    return this.products.getPublicByIdOrFail(id);
  }
}
