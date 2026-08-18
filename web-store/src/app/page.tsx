'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../lib/storeContext';
import {
  IconProducts,
  IconOrders,
  IconTrendingUp,
  IconPlus,
  IconImport,
  IconTelegram,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconRefresh,
  IconSparkles,
  IconMapPin,
  IconPhone
} from '../components/icons';
import { OrderStatus } from '../lib/types';

export default function DashboardPage() {
  const { stats, orders, products, store, updateOrderStatus, loading } = useStore();

  const recentOrders = orders.slice(0, 5);
  const outOfStockProducts = products.filter((p) => !p.price?.inStock);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'CONFIRMED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PREPARING':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'DELIVERING':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'Yangi';
      case 'CONFIRMED':
        return 'Qabul qilingan';
      case 'PREPARING':
        return 'Tayyorlanmoqda';
      case 'DELIVERING':
        return 'Yetkazilmoqda';
      case 'DELIVERED':
        return 'Yetkazildi';
      case 'CANCELLED':
        return 'Bekor qilingan';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-stone-900 to-stone-900 border border-stone-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
                Imora Do‘kon Paneli (Otabek)
              </span>
              <span className="text-xs text-stone-400">· Real-vaqt sinxronizatsiyasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Xush kelibsiz, {store.name}!
            </h1>
            <p className="text-sm text-stone-300 max-w-xl">
              Do‘koningiz mahsulotlari, buyurtmalar oqimi va narxlarni boshqaring. Barcha
              o‘zgarishlar Imora mijoz ilovasida darhol aks etadi.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/products?action=new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <IconPlus className="w-4 h-4" />
              <span>Yangi mahsulot</span>
            </Link>
            <Link
              href="/import"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm border border-stone-700 transition-all"
            >
              <IconImport className="w-4 h-4" />
              <span>Excel Import</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Jami Mahsulotlar</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <IconProducts className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{stats.totalProducts}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-400">
            <span>Faol: <strong className="text-emerald-400">{stats.activeProducts} ta</strong></span>
            <span>Omborda: <strong className="text-amber-400">{stats.inStockProducts} ta</strong></span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Yangi Buyurtmalar</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <IconOrders className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{stats.newOrders}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-400">
            <span>Jami: <strong className="text-stone-200">{stats.totalOrders} ta</strong></span>
            <span className="text-emerald-400">Yetkazilgan: {stats.deliveredOrders}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Umumiy Savdo</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <IconTrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-emerald-400 truncate">
            {stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-stone-400">UZS</span>
          </p>
          <p className="mt-2 text-xs text-stone-400">
            Oxirgi 30 kunlik muvaffaqiyatli buyurtmalar
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Telegram Xabarnoma</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <IconTelegram className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-bold text-stone-200">Bot faol ulangan</span>
          </div>
          <Link
            href="/profile#telegram-bot"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300"
          >
            <span>Bot sozlamalarini ko‘rish</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">So‘nggi Buyurtmalar</h2>
              <p className="text-xs text-stone-400">Kelib tushgan buyurtmalarni tezkor tasdiqlang</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Barchasini ko‘rish ({orders.length})</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-800/80 shadow-sm">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                Hozircha buyurtmalar yo‘q
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-5 hover:bg-stone-800/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">
                          #{order.id.slice(-4).toUpperCase()}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="text-xs text-stone-500">
                          {new Date(order.createdAt).toLocaleTimeString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300">
                        {order.items.map((i) => `${i.productNameSnapshot} (${i.qty}x)`).join(', ')}
                      </p>
                      {order.note && (
                        <p className="text-xs text-amber-400/90 italic">«{order.note}»</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-400">
                          {order.total.toLocaleString()} UZS
                        </p>
                        <p className="text-[11px] text-stone-400">{order.items.length} xil mahsulot</p>
                      </div>

                      {/* Quick action buttons */}
                      {order.status === 'NEW' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-900/40 transition-all"
                        >
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Qabul qilish</span>
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <span>Tayyorlash</span>
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERING')}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <span>Yo‘lga chiqarish</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Out of stock alerts & Quick Shortcuts (1 span) */}
        <div className="space-y-6">
          {/* Out of Stock Alert Box */}
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Zaxira tugagan mahsulotlar
              </h3>
              <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/50">
                {outOfStockProducts.length} ta
              </span>
            </div>
            {outOfStockProducts.length === 0 ? (
              <p className="text-xs text-stone-400 py-2">Barcha mahsulotlar omborda yetarli mavjud.</p>
            ) : (
              <div className="space-y-2.5">
                {outOfStockProducts.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-800/60 text-xs border border-stone-700/50"
                  >
                    <div className="truncate max-w-[170px]">
                      <p className="font-semibold text-stone-200 truncate">{prod.name}</p>
                      <p className="text-[11px] text-stone-400">{prod.price?.price.toLocaleString()} UZS</p>
                    </div>
                    <Link
                      href={`/products?edit=${prod.id}`}
                      className="text-xs font-bold text-amber-400 hover:underline"
                    >
                      To‘ldirish
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Telegram Bot Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-sky-950/40 border border-sky-900/50 space-y-3">
            <div className="flex items-center gap-2 text-sky-400">
              <IconTelegram className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Telegram Do‘kon Boti</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Bot orqali telefoningizdan yangi buyurtmalarni tasdiqlashingiz va mahsulot narxlarini 1 soniyada
              o‘zgartirishingiz mumkin.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <code className="text-[11px] bg-stone-950 px-2.5 py-1 rounded-md text-sky-300 border border-sky-900/40">
                /price &lt;id&gt; &lt;narx&gt;
              </code>
              <Link
                href="/profile#telegram-bot"
                className="text-xs font-bold text-sky-400 hover:text-sky-300"
              >
                Ko‘rsatma →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
