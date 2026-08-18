'use client';

import React from 'react';
import { useStore } from '../lib/storeContext';
import { IconCheck, IconX, IconAlertTriangle } from './icons';

export function NotificationToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all transform translate-y-0 opacity-100 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-50 border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-900/95 text-rose-50 border-rose-700'
              : 'bg-stone-900/95 text-stone-50 border-stone-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <IconCheck className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <IconX className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <IconAlertTriangle className="w-5 h-5 text-amber-400" />}
          </div>
          <p className="flex-1 leading-snug">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-white transition-colors ml-1"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
