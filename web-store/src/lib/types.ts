import type {
  CategoryDto,
  ProductDto,
  ProductPriceDto,
  StoreDto,
  OrderDto,
  OrderItemDto,
  OrderStatus,
  StoreStatus,
  UserDto,
  TokenPairDto,
  AddressDto
} from '@imora/shared-types';

export type {
  CategoryDto,
  ProductDto,
  ProductPriceDto,
  StoreDto,
  OrderDto,
  OrderItemDto,
  OrderStatus,
  StoreStatus,
  UserDto,
  TokenPairDto,
  AddressDto
};

export interface ProductFormData {
  name: string;
  categoryId: string;
  description: string;
  unit: string;
  price: number;
  currency: string;
  inStock: boolean;
  imageUrls: string[];
  attributes: Record<string, string | number | boolean>;
  isActive: boolean;
}

export interface StoreProfileFormData {
  name: string;
  phone: string;
  region: string;
  districts: string[];
  logoUrl?: string;
}

export interface ImportPreviewRow {
  id?: string;
  name: string;
  categoryName?: string;
  categoryId?: string;
  unit: string;
  price: number;
  inStock: boolean;
  description?: string;
  tags?: string;
  isValid: boolean;
  errors: string[];
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  inStockProducts: number;
  totalOrders: number;
  newOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}
