'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/storeContext';
import { OrderDto, OrderStatus } from '../../lib/types';
import {
  IconSearch,
  IconCheck,
  IconX,
  IconClock,
  IconMapPin,
  IconPhone,
  IconDownload,
  IconAlertTriangle,
  IconTrendingUp,
  IconSparkles
} from '../../components/icons';

const STATUS_TABS: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Barchasi' },
  { key: 'NEW', label: 'Yangi' },
  { key: 'CONFIRMED', label: 'Qabul qilingan' },
  { key: 'PREPARING', label: 'Tayyorlanmoqda' },
  { key: 'DELIVERING', label: 'Yetkazilmoqda' },
  { key: 'DELIVERED', label: 'Yetkazildi' },
  { key: 'CANCELLED', label: 'Bekor qilingan' }
];

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useStore();

  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  // Cancellation Modal state
  const [cancelCandidate, setCancelCandidate] = useState<OrderDto | null>(null);
  const [cancelReason, setCancelReason] = useState('Mahsulot omborda yetarli emas');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === 'ALL' || order.status === activeTab;
      const matchesSearch =
        searchQuery === '' ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((i) =>
          i.productNameSnapshot.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

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

  const handleConfirmCancel = async () => {
    if (!cancelCandidate) return;
    await updateOrderStatus(cancelCandidate.id, 'CANCELLED', cancelReason);
    setCancelCandidate(null);
    setCancelReason('Mahsulot omborda yetarli emas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Buyurtmalar Boshqaruvi</h1>
          <p className="text-xs text-stone-400">
            Mijozlardan kelib tushgan buyurtmalarni ko‘rib chiqing va holatini o‘zgartiring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Jami buyurtmalar:</span>
          <strong className="text-sm text-amber-400 font-bold">{orders.length} ta</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-800">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'ALL'
              ? orders.length
              : orders.filter((o) => o.status === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-stone-950/20 text-stone-950'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buyurtma ID yoki mahsulot nomi bo‘yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-800 text-stone-200 placeholder-stone-500 border border-stone-700/80 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-stone-900/90 border border-stone-800 rounded-2xl text-stone-400 text-xs">
            Ushbu filtr bo‘yicha buyurtmalar topilmadi.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('uz-UZ', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all space-y-4 shadow-sm"
              >
                {/* Header of Order Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white text-base">
                      #{order.id.slice(-4).toUpperCase()}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <IconClock className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">Jami summa:</span>
                    <span className="text-base font-black text-emerald-400">
                      {order.total.toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                {/* Items and Client note */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-2">
                    <p className="font-semibold text-stone-400 text-[11px] uppercase tracking-wider">
                      Buyurtma tarkibi ({order.items.length} ta mahsulot)
                    </p>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-800/60 border border-stone-700/50"
                        >
                          <span className="font-medium text-stone-200 truncate max-w-[280px]">
                            {item.productNameSnapshot}
                          </span>
                          <div className="text-right shrink-0">
                            <span className="text-stone-400 mr-3">{item.qty} dona</span>
                            <span className="font-bold text-amber-400">
                              {(item.price * item.qty).toLocaleString()} UZS
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.note && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                        <strong>Mijoz izohi:</strong> «{order.note}»
                      </div>
                    )}
                  </div>

                  {/* Delivery Info & Actions */}
                  <div className="space-y-3 bg-stone-800/40 p-4 rounded-xl border border-stone-800 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold text-stone-400 text-[11px] uppercase tracking-wider mb-2">
                        Yetkazib berish manzili
                      </p>
                      <div className="flex items-start gap-2 text-stone-300 text-xs">
                        <IconMapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>Toshkent sh., Yunusobod tumani, 14-mavze 22-uy</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-300 text-xs mt-2">
                        <IconPhone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>+998 90 987 65 43</span>
                      </div>
                    </div>

                    {/* Action Flow Buttons */}
                    <div className="pt-3 border-t border-stone-700/60 flex flex-wrap items-center gap-2">
                      {order.status === 'NEW' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-900/30"
                          >
                            <IconCheck className="w-3.5 h-3.5" />
                            <span>Qabul qilish</span>
                          </button>
                          <button
                            onClick={() => setCancelCandidate(order)}
                            className="py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-400 border border-rose-800/60 font-semibold text-xs"
                          >
                            Bekor qilish
                          </button>
                        </>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                          >
                            <span>Tayyorlashga o‘tkazish</span>
                          </button>
                          <button
                            onClick={() => setCancelCandidate(order)}
                            className="py-2 px-3 rounded-xl bg-rose-950/60 text-rose-400 text-xs font-semibold"
                          >
                            Bekor qilish
                          </button>
                        </>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERING')}
                          className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <span>Kuryerga / Yo‘lga chiqarish</span>
                        </button>
                      )}

                      {order.status === 'DELIVERING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-900/40"
                        >
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Yetkazilgan deb belgilash</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="w-full py-1.5 rounded-xl bg-stone-700/60 hover:bg-stone-700 text-stone-300 text-xs font-medium"
                      >
                        Batafsil / Chek ko‘rish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Reason Modal */}
      {cancelCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <IconAlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Buyurtmani bekor qilish</h3>
            </div>
            <p className="text-xs text-stone-300">
              #{cancelCandidate.id.slice(-4).toUpperCase()} raqamli buyurtmani bekor qilish sababini
              tanlang yoki kiriting:
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="Mahsulot omborda yetarli emas">Mahsulot omborda yetarli emas</option>
              <option value="Mijoz bilan bog‘lanib bo‘lmadi">Mijoz bilan bog‘lanib bo‘lmadi</option>
              <option value="Manzil yetkazib berish doirasidan tashqarida">
                Manzil yetkazib berish doirasidan tashqarida
              </option>
              <option value="Mijoz o‘zi bekor qilishni so‘radi">Mijoz o‘zi bekor qilishni so‘radi</option>
            </select>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelCandidate(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
              >
                Orqaga
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Bekor qilishni tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail / Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Buyurtma Cheki #{selectedOrder.id.slice(-4).toUpperCase()}
                </h2>
                <p className="text-xs text-stone-400">
                  {new Date(selectedOrder.createdAt).toLocaleString('uz-UZ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between">
                <span className="text-stone-400">Holat:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>

              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-800/60 text-stone-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Mahsulot</th>
                      <th className="p-2.5 text-center">Soni</th>
                      <th className="p-2.5 text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-medium">{item.productNameSnapshot}</td>
                        <td className="p-2.5 text-center text-stone-400">{item.qty}x</td>
                        <td className="p-2.5 text-right font-bold text-amber-400">
                          {(item.price * item.qty).toLocaleString()} UZS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/40 border border-stone-800 text-sm">
                <span className="font-bold text-white">Jami to‘lov:</span>
                <span className="font-black text-emerald-400 text-base">
                  {selectedOrder.total.toLocaleString()} UZS
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700"
              >
                <IconDownload className="w-4 h-4" />
                <span>Chop etish (Print)</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
