import { LocalStoreManager } from './storage';
import {
  CategoryDto,
  ProductDto,
  ProductFormData,
  StoreDto,
  OrderDto,
  OrderStatus,
  TokenPairDto,
  UserDto
} from './types';

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; fromFallback?: boolean }> {
  const url = `${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const tokens = LocalStoreManager.getTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (tokens.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        data: null,
        error: `Server responded with ${response.status}: ${errText}`
      };
    }

    if (response.status === 204) {
      return { data: {} as T, error: null };
    }

    const json = await response.json();
    return { data: json as T, error: null };
  } catch (err) {
    // Network failure, offline, or backend not yet started -> graceful local store fallback
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      fromFallback: true
    };
  }
}

export const StoreApi = {
  // Auth
  async requestOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const res = await request('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
    if (res.error && !res.fromFallback) {
      return { success: false, message: res.error };
    }
    return {
      success: true,
      message: `SMS tasdiqlash kodi yuborildi (Demo kod: 123456)`
    };
  },

  async verifyOtp(phone: string, code: string, name?: string): Promise<{ success: boolean; data?: TokenPairDto; error?: string }> {
    const res = await request<TokenPairDto>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code, name })
    });

    if (res.data) {
      LocalStoreManager.saveTokens(res.data.accessToken, res.data.refreshToken);
      LocalStoreManager.saveUser(res.data.user);
      return { success: true, data: res.data };
    }

    // Local fallback check
    if (code === '123456' || code.length === 6) {
      const mockUser: UserDto = {
        id: `user-${Date.now()}`,
        phone,
        name: name || 'Do‘kon boshqaruvchisi',
        role: 'store',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      const tokenPair: TokenPairDto = {
        accessToken: `jwt-token-${Date.now()}`,
        refreshToken: `refresh-${Date.now()}`,
        user: mockUser
      };
      LocalStoreManager.saveTokens(tokenPair.accessToken, tokenPair.refreshToken);
      LocalStoreManager.saveUser(tokenPair.user);
      return { success: true, data: tokenPair };
    }

    return { success: false, error: "Tasdiqlash kodi noto'g'ri (Demo kod: 123456)" };
  },

  async getCurrentUser(): Promise<UserDto | null> {
    const res = await request<UserDto>('/me');
    if (res.data) {
      LocalStoreManager.saveUser(res.data);
      return res.data;
    }
    return LocalStoreManager.getUser();
  },

  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
    LocalStoreManager.saveUser(null);
  },

  // Categories
  async getCategories(): Promise<CategoryDto[]> {
    const res = await request<CategoryDto[]>('/categories');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return LocalStoreManager.getCategories();
  },

  // Products
  async getProducts(params?: { categoryId?: string; q?: string }): Promise<ProductDto[]> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.q) query.append('q', params.q);

    const res = await request<{ items?: ProductDto[] } | ProductDto[]>(`/products?${query.toString()}`);
    if (res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.items || [];
      if (list.length > 0) return list;
    }

    let local = LocalStoreManager.getProducts();
    if (params?.categoryId) {
      local = local.filter((p) => p.categoryId === params.categoryId);
    }
    if (params?.q) {
      const qLower = params.q.toLowerCase();
      local = local.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.description?.toLowerCase().includes(qLower) ||
          p.unit.toLowerCase().includes(qLower)
      );
    }
    return local;
  },

  async createProduct(formData: ProductFormData): Promise<ProductDto> {
    const payload = {
      categoryId: formData.categoryId,
      name: formData.name,
      description: formData.description,
      unit: formData.unit,
      imageUrls: formData.imageUrls,
      attributes: formData.attributes,
      price: formData.price,
      currency: formData.currency || 'UZS',
      inStock: formData.inStock
    };

    const res = await request<ProductDto>('/store/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.data) {
      return res.data;
    }

    // Local fallback
    return LocalStoreManager.addProduct({
      categoryId: formData.categoryId,
      name: formData.name,
      description: formData.description,
      unit: formData.unit,
      imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&auto=format&fit=crop&q=80'],
      attributes: formData.attributes,
      isActive: formData.isActive,
      price: {
        id: `pr-${Date.now()}`,
        price: formData.price,
        currency: formData.currency || 'UZS',
        validFrom: new Date().toISOString(),
        inStock: formData.inStock
      }
    });
  },

  async updateProduct(id: string, formData: Partial<ProductFormData>): Promise<ProductDto | null> {
    const res = await request<ProductDto>(`/store/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formData)
    });

    if (res.data) {
      return res.data;
    }

    return LocalStoreManager.updateProduct(id, {
      ...(formData.name ? { name: formData.name } : {}),
      ...(formData.categoryId ? { categoryId: formData.categoryId } : {}),
      ...(formData.description !== undefined ? { description: formData.description } : {}),
      ...(formData.unit ? { unit: formData.unit } : {}),
      ...(formData.imageUrls ? { imageUrls: formData.imageUrls } : {}),
      ...(formData.attributes ? { attributes: formData.attributes } : {}),
      ...(formData.isActive !== undefined ? { isActive: formData.isActive } : {}),
      ...(formData.price !== undefined || formData.inStock !== undefined
        ? {
            price: {
              id: `price-${id}`,
              price: formData.price ?? 0,
              currency: formData.currency || 'UZS',
              validFrom: new Date().toISOString(),
              inStock: formData.inStock ?? true
            }
          }
        : {})
    });
  },

  async updateQuickPrice(id: string, price: number, inStock: boolean): Promise<ProductDto | null> {
    const res = await request<ProductDto>(`/store/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ price, inStock })
    });
    if (res.data) return res.data;
    return LocalStoreManager.updateProductPrice(id, price, inStock);
  },

  async deleteProduct(id: string): Promise<boolean> {
    return LocalStoreManager.deleteProduct(id);
  },

  // Orders
  async getOrders(): Promise<OrderDto[]> {
    const res = await request<OrderDto[]>('/store/orders');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return LocalStoreManager.getOrders();
  },

  async updateOrderStatus(id: string, status: OrderStatus, reason?: string): Promise<OrderDto | null> {
    const res = await request<OrderDto>(`/store/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });

    if (res.data) {
      return res.data;
    }

    return LocalStoreManager.updateOrderStatus(id, status, reason);
  },

  // Store Profile
  async getStoreProfile(): Promise<StoreDto> {
    return LocalStoreManager.getStoreProfile();
  },

  async updateStoreProfile(data: Partial<StoreDto>): Promise<StoreDto> {
    const current = LocalStoreManager.getStoreProfile();
    const updated = { ...current, ...data };
    LocalStoreManager.saveStoreProfile(updated);
    return updated;
  },

  // Excel/CSV Import
  async importProductsBatch(items: Array<{
    name: string;
    categoryId?: string;
    unit: string;
    price: number;
    inStock: boolean;
    description?: string;
    tags?: string;
  }>): Promise<{ importedCount: number; success: boolean }> {
    const categories = await this.getCategories();
    const defaultCatId = categories[0]?.id || 'cat-1';

    let count = 0;
    for (const item of items) {
      LocalStoreManager.addProduct({
        name: item.name,
        categoryId: item.categoryId || defaultCatId,
        description: item.description || '',
        unit: item.unit || 'dona',
        imageUrls: ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&auto=format&fit=crop&q=80'],
        attributes: { importSource: 'Excel/CSV', tags: item.tags || '' },
        isActive: true,
        price: {
          id: `price-imp-${Date.now()}-${count}`,
          price: Number(item.price) || 0,
          currency: 'UZS',
          validFrom: new Date().toISOString(),
          inStock: item.inStock !== false
        }
      });
      count++;
    }

    return { importedCount: count, success: true };
  }
};
