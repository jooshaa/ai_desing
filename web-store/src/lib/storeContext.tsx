'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  CategoryDto,
  ProductDto,
  ProductFormData,
  StoreDto,
  OrderDto,
  OrderStatus,
  UserDto,
  DashboardStats
} from './types';
import { StoreApi } from './api';
import { LocalStoreManager } from './storage';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  store: StoreDto;
  user: UserDto | null;
  categories: CategoryDto[];
  products: ProductDto[];
  orders: OrderDto[];
  stats: DashboardStats;
  loading: boolean;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  createProduct: (data: ProductFormData) => Promise<ProductDto | null>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<ProductDto | null>;
  updateQuickPrice: (id: string, price: number, inStock: boolean) => Promise<ProductDto | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<OrderDto | null>;
  updateStoreProfile: (data: Partial<StoreDto>) => Promise<StoreDto>;
  importProducts: (items: any[]) => Promise<number>;
  logout: () => Promise<void>;
  setUser: (u: UserDto | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreDto>(LocalStoreManager.getStoreProfile());
  const [user, setUser] = useState<UserDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [stats, setStats] = useState<DashboardStats>(LocalStoreManager.getStats());
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods, ords, prof, currentUser] = await Promise.all([
        StoreApi.getCategories(),
        StoreApi.getProducts(),
        StoreApi.getOrders(),
        StoreApi.getStoreProfile(),
        StoreApi.getCurrentUser()
      ]);
      setCategories(cats);
      setProducts(prods);
      setOrders(ords);
      setStore(prof);
      setUser(currentUser);
      setStats(LocalStoreManager.getStats());
    } catch (err) {
      console.error('Error refreshing store data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreateProduct = async (data: ProductFormData): Promise<ProductDto | null> => {
    try {
      const created = await StoreApi.createProduct(data);
      if (created) {
        setProducts((prev) => [created, ...prev]);
        setStats(LocalStoreManager.getStats());
        addToast(`"${created.name}" mahsuloti muvaffaqiyatli qo‘shildi!`);
        return created;
      }
      return null;
    } catch (err) {
      addToast('Mahsulot qo‘shishda xatolik yuz berdi', 'error');
      return null;
    }
  };

  const handleUpdateProduct = async (id: string, data: Partial<ProductFormData>): Promise<ProductDto | null> => {
    try {
      const updated = await StoreApi.updateProduct(id, data);
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        setStats(LocalStoreManager.getStats());
        addToast(`Mahsulot ma'lumotlari yangilandi`);
        return updated;
      }
      return null;
    } catch (err) {
      addToast('Mahsulotni tahrirlashda xatolik', 'error');
      return null;
    }
  };

  const handleUpdateQuickPrice = async (id: string, price: number, inStock: boolean): Promise<ProductDto | null> => {
    try {
      const updated = await StoreApi.updateQuickPrice(id, price, inStock);
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        setStats(LocalStoreManager.getStats());
        addToast(`Narx va zaxira holati yangilandi (${price.toLocaleString()} UZS)`);
        return updated;
      }
      return null;
    } catch (err) {
      addToast('Narxni yangilashda xatolik', 'error');
      return null;
    }
  };

  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    try {
      const success = await StoreApi.deleteProduct(id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setStats(LocalStoreManager.getStats());
        addToast('Mahsulot o‘chirildi');
        return true;
      }
      return false;
    } catch {
      addToast('Mahsulotni o‘chirishda xatolik', 'error');
      return false;
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<OrderDto | null> => {
    try {
      const updated = await StoreApi.updateOrderStatus(orderId, status, reason);
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        setStats(LocalStoreManager.getStats());
        addToast(`Buyurtma #${orderId.slice(-4)} holati "${status}" ga o‘zgartirildi!`);
        return updated;
      }
      return null;
    } catch (err) {
      addToast('Buyurtma holatini o‘zgartirishda xatolik', 'error');
      return null;
    }
  };

  const handleUpdateStoreProfile = async (data: Partial<StoreDto>): Promise<StoreDto> => {
    const updated = await StoreApi.updateStoreProfile(data);
    setStore(updated);
    addToast('Do‘kon profili muvaffaqiyatli saqlandi');
    return updated;
  };

  const handleImportProducts = async (items: any[]): Promise<number> => {
    const res = await StoreApi.importProductsBatch(items);
    await refreshData();
    addToast(`${res.importedCount} ta mahsulot muvaffaqiyatli import qilindi!`);
    return res.importedCount;
  };

  const handleLogout = async () => {
    await StoreApi.logout();
    setUser(null);
    addToast('Tizimdan chiqildi', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        user,
        categories,
        products,
        orders,
        stats,
        loading,
        toasts,
        addToast,
        removeToast,
        refreshData,
        createProduct: handleCreateProduct,
        updateProduct: handleUpdateProduct,
        updateQuickPrice: handleUpdateQuickPrice,
        deleteProduct: handleDeleteProduct,
        updateOrderStatus: handleUpdateOrderStatus,
        updateStoreProfile: handleUpdateStoreProfile,
        importProducts: handleImportProducts,
        logout: handleLogout,
        setUser
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
