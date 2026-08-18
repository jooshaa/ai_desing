'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/storeContext';
import { UZBEK_REGIONS, REGION_DISTRICTS } from '../../lib/mockData';
import {
  IconStoreProfile,
  IconTelegram,
  IconCheck,
  IconRefresh,
  IconPhone,
  IconMapPin,
  IconSparkles,
  IconAlertTriangle
} from '../../components/icons';

export default function ProfilePage() {
  const { store, user, updateStoreProfile, addToast } = useStore();

  const [name, setName] = useState(store.name);
  const [phone, setPhone] = useState(store.phone);
  const [region, setRegion] = useState(store.region);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(store.districts || []);
  const [logoUrl, setLogoUrl] = useState(store.logoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const availableDistricts = REGION_DISTRICTS[region] || [
    'Markaziy tuman',
    'Shimoliy tuman',
    'Janubiy tuman'
  ];

  const handleToggleDistrict = (d: string) => {
    if (selectedDistricts.includes(d)) {
      setSelectedDistricts(selectedDistricts.filter((item) => item !== d));
    } else {
      setSelectedDistricts([...selectedDistricts, d]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateStoreProfile({
      name,
      phone,
      region,
      districts: selectedDistricts,
      logoUrl
    });
    setIsSaving(false);
  };

  const handleCopyToken = () => {
    const token = `imora_store_token_${store.id}`;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    addToast('Do‘kon kaliti nusxalandi');
    setTimeout(() => setCopiedToken(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Do‘kon Profili va Sozlamalar</h1>
        <p className="text-xs text-stone-400">
          Do‘koningiz ma'lumotlari, yetkazib berish hududlari va Telegram bot integratsiyasini boshqaring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-6 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <IconStoreProfile className="w-5 h-5 text-amber-400" />
                <span>Asosiy ma'lumotlar</span>
              </h2>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                Holat: {store.status.toUpperCase()}
              </span>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Do‘kon nomi *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Phone & Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Bog‘lanish telefoni *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Mas'ul shaxs (Egasi)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.name || 'Otabek'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/50 border border-stone-800 text-stone-400 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Viloyat / Shahar *
              </label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setSelectedDistricts([]);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
              >
                {UZBEK_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Districts Multi-select */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300">
                Xizmat ko‘rsatuvchi tumanlar (Yetkazib berish qamrovi)
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableDistricts.map((d) => {
                  const isChecked = selectedDistricts.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleToggleDistrict(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isChecked
                          ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                          : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      {d} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Do‘kon logotipi (Rasm havolasi)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                />
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-10 h-10 rounded-xl object-cover border border-stone-700 shrink-0"
                  />
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                {isSaving ? 'Saqlanmoqda...' : 'Profilni saqlash'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 col: Telegram Bot Card */}
        <div className="space-y-6" id="telegram-bot">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-sky-950/50 border border-sky-900/50 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400">
                <IconTelegram className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Telegram Do‘kon Boti</h3>
                <p className="text-[11px] text-sky-400">@imora_store_bot</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Telegram boti orqali yangi buyurtmalar haqida tezkor xabarlar oling, buyurtmalarni tasdiqlang
              va do‘kon mahsulotlari narxlarini bevosita messenjerdan o‘zgartiring.
            </p>

            {/* Token display */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Do‘kon ulanish kaliti (Token)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 rounded-xl bg-stone-950 text-sky-300 font-mono text-[11px] border border-sky-900/50 truncate">
                  imora_store_token_{store.id}
                </code>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700"
                >
                  {copiedToken ? '✓' : 'Nusxa'}
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2.5 pt-2 border-t border-sky-950 text-xs text-stone-300">
              <p className="font-bold text-white">Qanday ulanadi?</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-400">
                <li>
                  Telegramda <strong className="text-sky-300">@imora_store_bot</strong> ni oching.
                </li>
                <li>
                  <code className="text-sky-300 bg-stone-950 px-1 py-0.5 rounded">/start</code> ni bosing.
                </li>
                <li>Yuqoridagi kalitni yoki telefon raqamingizni yuboring.</li>
                <li>
                  Tayyor! Bot buyurtma bildirishnomalarini yuboradi va narxlarni yangilashga imkon beradi.
                </li>
              </ol>
            </div>

            <a
              href={`https://t.me/imora_store_bot?start=auth_${store.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs transition-all shadow-md shadow-sky-900/40"
            >
              Telegramda ochish →
            </a>
          </div>

          {/* API Info */}
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 text-xs space-y-2">
            <h4 className="font-bold text-stone-200">Backend API Aloqasi</h4>
            <p className="text-[11px] text-stone-400">
              Endpoint: <code className="text-amber-400">http://localhost:3001/api</code>
            </p>
            <p className="text-[11px] text-stone-500">
              OpenAPI shartnomalari bo‘yicha to‘liq sinxronlangan (Core, Catalog, Orders).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
