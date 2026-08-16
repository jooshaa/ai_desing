import type { OrderStatus } from './enums';

export interface CartItemDto {
  id: string;
  productId: string;
  qty: number;
  priceSnapshot: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  updatedAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  qty: number;
  price: number;
  productNameSnapshot: string;
}

export interface OrderDto {
  id: string;
  userId: string;
  storeId: string;
  addressId: string;
  status: OrderStatus;
  total: number;
  note: string | null;
  items: OrderItemDto[];
  createdAt: string;
}

export interface OfferDto {
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  currency: string;
  inStock: boolean;
  distanceKm: number | null;
}
