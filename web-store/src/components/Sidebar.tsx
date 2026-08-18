'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconProducts,
  IconOrders,
  IconImport,
  IconStoreProfile,
  IconSparkles,
  IconTelegram
} from './icons';
import { useStore } from '../lib/storeContext';

export function Sidebar({ mobileOpen = false, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { stats, store } = useStore();

  const navItems = [
    { href: '/', label: 'Bosh sahifa (Dashboard)', icon: IconDashboard },
    {
      href: '/products',
      label: 'Mahsulotlar katalogi',
      icon: IconProducts,
      badge: stats.totalProducts.toString()
    },
    {
      href: '/orders',
      label: 'Buyurtmalar',
      icon: IconOrders,
      badge: stats.newOrders > 0 ? `${stats.newOrders} yangi` : undefined,
      badgeColor: 'bg-amber-500 text-stone-950 font-bold'
    },
    { href: '/import', label: 'Excel / CSV Import', icon: IconImport },
    { href: '/profile', label: 'Do‘kon profili va Bot', icon: IconStoreProfile }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-stone-900 text-stone-200 border-r border-stone-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-stone-800/80">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-black text-xl shadow-lg shadow-amber-500/20">
            I
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">IMORA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Store
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate max-w-[170px]">{store.name}</p>
          </div>
        </div>

        {/* Store Status Chip */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="text-xs">
                <p className="font-medium text-stone-200">Holat: Faol</p>
                <p className="text-[11px] text-stone-400">{store.region}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
              Online
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-semibold'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-stone-950/20 text-stone-950'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Telegram Bot Quick Widget */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-stone-800/40 to-stone-800/60 border border-blue-900/40">
          <div className="flex items-center gap-2 mb-2">
            <IconTelegram className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wide">Telegram Bot</span>
          </div>
          <p className="text-xs text-stone-300 mb-3 leading-relaxed">
            Narxlarni bot orqali 1 soniyada yangilang va yangi buyurtmalarni oling.
          </p>
          <Link
            href="/profile#telegram-bot"
            className="block text-center text-xs font-semibold py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-stone-950 transition-colors"
          >
            Botni ulash
          </Link>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Imora v1.0 MVP</span>
          <span>Port: 3002</span>
        </div>
      </aside>
    </>
  );
}
