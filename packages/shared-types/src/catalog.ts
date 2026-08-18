import type { StoreStatus } from './enums';

export interface CategoryDto {
  id: string;
  parentId: string | null;
  nameUz: string;
  nameRu: string;
  slug: string;
  sort: number;
  icon: string | null;
  children?: CategoryDto[];
}

export interface StoreDto {
  id: string;
  name: string;
  ownerUserId: string;
  phone: string;
  region: string;
  districts: string[];
  status: StoreStatus;
  logoUrl: string | null;
}

export interface ProductPriceDto {
  id: string;
  price: number;
  currency: string;
  validFrom: string;
  inStock: boolean;
}

export interface ProductDto {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string | null;
  unit: string;
  imageUrls: string[];
  attributes: Record<string, unknown>;
  isActive: boolean;
  price?: ProductPriceDto;
}

export interface ProductPageDto {
  items: ProductDto[];
  total: number;
  page: number;
  limit: number;
}

export interface ImportResultDto {
  created: number;
  failed: { row: number; error: string }[];
}
