'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoreApi } from '../../lib/api';
import { useStore } from '../../lib/storeContext';
import {
  IconPhone,
  IconCheck,
  IconSparkles,
  IconStoreProfile,
  IconArrowRight,
  IconAlertTriangle
} from '../../components/icons';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, addToast, refreshData } = useStore();

  const [step, setStep] = useState<'PHONE' | 'OTP' | 'STORE_SETUP'>('PHONE');
  const [phone, setPhone] = useState('+998901234567');
  const [otpCode, setOtpCode] = useState('');
  const [storeName, setStoreName] = useState('Imora Qurilish Do‘koni');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await StoreApi.requestOtp(phone);
    setLoading(false);

    if (res.success) {
      addToast(res.message, 'info');
      setStep('OTP');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await StoreApi.verifyOtp(phone, otpCode);
    setLoading(false);

    if (res.success && res.data) {
      setUser(res.data.user);
      await refreshData();
      addToast('Muvaffaqiyatli tizimga kirildi!');
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Tasdiqlash kodi noto‘g‘ri');
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    const res = await StoreApi.verifyOtp('+998901234567', '123456', 'Otabek Nurmuhammedov');
    setLoading(false);
    if (res.success && res.data) {
      setUser(res.data.user);
      await refreshData();
      addToast('Demo rejimida kirildi!');
      router.push('/');
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 font-black text-2xl shadow-xl shadow-amber-500/20 mb-1">
          I
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Imora Do‘kon Paneli</h1>
        <p className="text-xs text-stone-400">
          Qurilish va pardozlash mahsulotlari do‘koni boshqaruv tizimi
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <IconAlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Phone Input */}
      {step === 'PHONE' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Telefon raqamingiz
            </label>
            <div className="relative">
              <IconPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-sm font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Raqamga 6 xonali tasdiqlash SMS kodi yuboriladi
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Yuborilmoqda...' : 'Kodni olish'}</span>
            <IconArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Step 2: OTP Code */}
      {step === 'OTP' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                SMS tasdiqlash kodi
              </label>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Raqamni o‘zgartirish
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-widest text-xl font-bold py-3 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-stone-400 mt-1 text-center">
              Demo rejimida ixtiyoriy 6 xonali kod yoki <strong className="text-white">123456</strong> kiriting
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <IconCheck className="w-4 h-4" />
            <span>{loading ? 'Tekshirilmoqda...' : 'Kirishni tasdiqlash'}</span>
          </button>
        </form>
      )}

      {/* Quick Demo Bypass Button */}
      <div className="pt-4 border-t border-stone-800 text-center space-y-3">
        <p className="text-[11px] text-stone-400">Sinov va baholash uchun tezkor kirish:</p>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-all flex items-center justify-center gap-2"
        >
          <IconSparkles className="w-4 h-4 text-amber-400" />
          <span>Demo Do‘kon Boshqaruvchisi sifatida kirish</span>
        </button>
      </div>
    </div>
  );
}
