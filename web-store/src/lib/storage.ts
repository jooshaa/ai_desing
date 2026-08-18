import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_STORE,
  INITIAL_USER
} from './mockData';
import {
  CategoryDto,
  ProductDto,
  StoreDto,
  OrderDto,
  OrderStatus,
  UserDto,
  DashboardStats
} from './types';

const STORAGE_KEYS = {
  CATEGORIES: 'imora_store_categories',
  PRODUCTS: 'imora_store_products',
  ORDERS: 'imora_store_orders',
  STORE: 'imora_store_profile',
  USER: 'imora_store_user',
  TOKEN: 'imora_access_token',
  REFRESH_TOKEN: 'imora_refresh_token'
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export const LocalStoreManager = {
  getCategories(): CategoryDto[] {
    if (!isClient()) return INITIAL_CATEGORIES;
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  getProducts(): ProductDto[] {
    if (!isClient()) return INITIAL_PRODUCTS;
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: ProductDto[]): void {
    if (!isClient()) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct(productData: Omit<ProductDto, 'id' | 'storeId'> & { id?: string }): ProductDto {
    const products = this.getProducts();
    const store = this.getStoreProfile();
    const newProduct: ProductDto = {
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      storeId: store.id,
      isActive: productData.isActive ?? true
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<ProductDto>): ProductDto | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = products[index];
    const updated: ProductDto = {
      ...existing,
      ...updates,
      price: updates.price ? { ...(existing.price || { id: `price-${id}`, currency: 'UZS', validFrom: new Date().toISOString(), inStock: true }), ...updates.price } : existing.price
    };
    products[index] = updated;
    this.saveProducts(products);
    return updated;
  },

  updateProductPrice(id: string, priceVal: number, inStockVal: boolean): ProductDto | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = products[index];
    existing.price = {
      id: existing.price?.id || `pr-${Date.now()}`,
      price: priceVal,
      currency: existing.price?.currency || 'UZS',
      validFrom: new Date().toISOString(),
      inStock: inStockVal
    };
    products[index] = existing;
    this.saveProducts(products);
    return existing;
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      this.saveProducts(filtered);
      return true;
    }
    return false;
  },

  getOrders(): OrderDto[] {
    if (!isClient()) return INITIAL_ORDERS;
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders: OrderDto[]): void {
    if (!isClient()) return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrderStatus(orderId: string, status: OrderStatus, reason?: string): OrderDto | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const existing = orders[index];
    const updated: OrderDto = {
      ...existing,
      status,
      note: reason ? `${existing.note ? existing.note + ' | ' : ''}Sabab: ${reason}` : existing.note
    };
    orders[index] = updated;
    this.saveOrders(orders);
    return updated;
  },

  getStoreProfile(): StoreDto {
    if (!isClient()) return INITIAL_STORE;
    const raw = localStorage.getItem(STORAGE_KEYS.STORE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(INITIAL_STORE));
      return INITIAL_STORE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_STORE;
    }
  },

  saveStoreProfile(store: StoreDto): void {
    if (!isClient()) return;
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(store));
  },

  getUser(): UserDto | null {
    if (!isClient()) return INITIAL_USER;
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USER;
    }
  },

  saveUser(user: UserDto | null): void {
    if (!isClient()) return;
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } else {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (!isClient()) return { accessToken: null, refreshToken: null };
    return {
      accessToken: localStorage.getItem(STORAGE_KEYS.TOKEN) || 'demo-store-token',
      refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || 'demo-refresh-token'
    };
  },

  saveTokens(access: string, refresh: string): void {
    if (!isClient()) return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  },

  getStats(): DashboardStats {
    const products = this.getProducts();
    const orders = this.getOrders();

    const activeProducts = products.filter((p) => p.isActive).length;
    const inStockProducts = products.filter((p) => p.price?.inStock).length;
    const newOrders = orders.filter((o) => o.status === 'NEW').length;
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;

    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalProducts: products.length,
      activeProducts,
      inStockProducts,
      totalOrders: orders.length,
      newOrders,
      deliveredOrders,
      totalRevenue,
      monthlyRevenue: totalRevenue * 0.75
    };
  },

  resetToDefaults(): void {
    if (!isClient()) return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(INITIAL_STORE));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
  }
};
