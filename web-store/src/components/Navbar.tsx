'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconMenu,
  IconBell,
  IconLogOut,
  IconPlus,
  IconRefresh,
  IconStoreProfile
} from './icons';
import { useStore } from '../lib/storeContext';

export function Navbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { store, user, stats, refreshData, loading, logout } = useStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 text-stone-200">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-white tracking-tight">{store.name}</h1>
          <p className="text-xs text-stone-400">
            {store.region} · {store.phone}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={() => refreshData()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700/80 rounded-xl transition-all disabled:opacity-50"
          title="Ma'lumotlarni yangilash"
        >
          <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden md:inline">Yangilash</span>
        </button>

        {/* Quick Add Product Button */}
        <Link
          href="/products?action=new"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/10"
        >
          <IconPlus className="w-4 h-4" />
          <span>Mahsulot qo‘shish</span>
        </Link>

        {/* Notification Bell */}
        <Link
          href="/orders"
          className="relative p-2 rounded-xl bg-stone-800 hover:bg-stone-700/80 text-stone-300 transition-colors"
          title="Buyurtmalar"
        >
          <IconBell className="w-5 h-5" />
          {stats.newOrders > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          )}
        </Link>

        {/* User avatar / profile button */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-800/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-700 flex items-center justify-center text-xs font-bold text-amber-400 border border-stone-600">
              {store.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <p className="font-semibold text-stone-200 truncate max-w-[120px]">
                {user?.name || store.name}
              </p>
              <p className="text-[11px] text-stone-400">Do‘kon egasi</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Chiqish"
          >
            <IconLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
