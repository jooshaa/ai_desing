import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { StoreCatalogController } from './store-catalog.controller';
import { AdminCatalogController } from './admin-catalog.controller';
import { CatalogService } from './catalog.service';
import { Store } from './stores/store.entity';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { ProductPrice } from './prices/product-price.entity';
import { ProductTag } from './tags/product-tag.entity';
import { CategoriesService } from './categories/categories.service';
import { StoresService } from './stores/stores.service';
import { ProductsService } from './products/products.service';
import { TagsService } from './tags/tags.service';
import { ImportService } from './import/import.service';
import { StorageService } from './storage/storage.service';
import { LocalDiskStorageService } from './storage/local-disk-storage.service';
import { UploadsController } from './storage/uploads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Category, Product, ProductPrice, ProductTag])],
  controllers: [
    CatalogController,
    StoreCatalogController,
    AdminCatalogController,
    UploadsController,
  ],
  providers: [
    CatalogService,
    CategoriesService,
    StoresService,
    ProductsService,
    TagsService,
    ImportService,
    { provide: StorageService, useClass: LocalDiskStorageService },
  ],
  // Only the facade crosses the module boundary — see catalog.service.ts.
  exports: [CatalogService],
})
export class CatalogModule {}
