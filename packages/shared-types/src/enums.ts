export type UserRole = 'user' | 'store' | 'admin';

export type StoreStatus = 'pending' | 'active' | 'blocked';

export type OrderStatus =
  'NEW' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';

export type DesignRequestStatus = 'queued' | 'processing' | 'done' | 'failed';
