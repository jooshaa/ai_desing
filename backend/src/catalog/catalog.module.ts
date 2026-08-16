import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Store } from './stores/store.entity';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { ProductPrice } from './prices/product-price.entity';
import { ProductTag } from './tags/product-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Category, Product, ProductPrice, ProductTag])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
