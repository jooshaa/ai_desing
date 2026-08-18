import { loadConfig } from '../config';
import { initialBotState } from './mockData';
import type { ProductDto, OrderDto, StoreDto, OrderStatus } from '@imora/shared-types';

export class BotApiClient {
  private config = loadConfig();
  private state = initialBotState;

  async getStoreProfile(storeId?: string): Promise<StoreDto> {
    const id = storeId || this.config.defaultStoreId;
    try {
      const res = await fetch(`${this.config.apiUrl}/admin/stores`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const stores = (await res.json()) as StoreDto[];
        const found = stores.find((s) => s.id === id);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return this.state.store;
  }

  async getProducts(query?: string): Promise<ProductDto[]> {
    try {
      const url = new URL(`${this.config.apiUrl}/products`);
      if (query) url.searchParams.append('q', query);
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.items || [];
        if (list.length > 0) return list;
      }
    } catch {
      // fallback
    }

    if (query) {
      const q = query.toLowerCase();
      return this.state.products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q)
      );
    }
    return this.state.products;
  }

  async getProductById(id: string): Promise<ProductDto | null> {
    const prods = await this.getProducts();
    return prods.find((p) => p.id === id) || null;
  }

  async updateProductPrice(productId: string, newPrice: number, inStock: boolean = true): Promise<ProductDto | null> {
    try {
      const res = await fetch(`${this.config.apiUrl}/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice, inStock }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return (await res.json()) as ProductDto;
      }
    } catch {
      // fallback
    }

    const index = this.state.products.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    const prod = this.state.products[index];
    prod.price = {
      id: prod.price?.id || `price-${Date.now()}`,
      price: newPrice,
      currency: 'UZS',
      validFrom: new Date().toISOString(),
      inStock
    };
    return prod;
  }

  async toggleProductStock(productId: string): Promise<ProductDto | null> {
    const prod = await this.getProductById(productId);
    if (!prod) return null;
    const nextStock = !(prod.price?.inStock ?? true);
    return this.updateProductPrice(productId, prod.price?.price ?? 0, nextStock);
  }

  async getOrders(): Promise<OrderDto[]> {
    try {
      const res = await fetch(`${this.config.apiUrl}/store/orders`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const orders = (await res.json()) as OrderDto[];
        if (Array.isArray(orders) && orders.length > 0) return orders;
      }
    } catch {
      // fallback
    }
    return this.state.orders;
  }

  async getOrderById(orderId: string): Promise<OrderDto | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === orderId) || null;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, reason?: string): Promise<OrderDto | null> {
    try {
      const res = await fetch(`${this.config.apiUrl}/store/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return (await res.json()) as OrderDto;
      }
    } catch {
      // fallback
    }

    const index = this.state.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const ord = this.state.orders[index];
    ord.status = status;
    if (reason) {
      ord.note = `${ord.note ? ord.note + ' | ' : ''}Sabab: ${reason}`;
    }
    return ord;
  }

  linkChatToStore(chatId: number, storeId: string): void {
    this.state.chatLinkedStores[chatId] = storeId;
  }

  getLinkedStore(chatId: number): string {
    return this.state.chatLinkedStores[chatId] || this.config.defaultStoreId;
  }
}

export const botApi = new BotApiClient();
