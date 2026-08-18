'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/storeContext';
import { ProductDto, ProductFormData } from '../../lib/types';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconUpload,
  IconRefresh,
  IconSparkles
} from '../../components/icons';

const UNITS = ['dona', 'm2', 'rulon', 'komplekt', 'kg', 'qop', 'metr', 'litr', 'paket'];

export default function ProductsPage() {
  const {
    products,
    categories,
    createProduct,
    updateProduct,
    updateQuickPrice,
    deleteProduct,
    refreshData
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ProductDto | null>(null);

  // Inline edit state
  const [inlinePriceMap, setInlinePriceMap] = useState<Record<string, number>>({});
  const [isSavingPriceId, setIsSavingPriceId] = useState<string | null>(null);

  // Form State
  const initialForm: ProductFormData = {
    name: '',
    categoryId: categories[0]?.id || 'cat-1',
    description: '',
    unit: 'dona',
    price: 100000,
    currency: 'UZS',
    inStock: true,
    imageUrls: ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&auto=format&fit=crop&q=80'],
    attributes: {},
    isActive: true
  };

  const [formData, setFormData] = useState<ProductFormData>(initialForm);
  const [attrKey, setAttrKey] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.unit.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && p.price?.inStock) ||
        (stockFilter === 'outOfStock' && !p.price?.inStock);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      categoryId: categories[0]?.id || 'cat-1'
    });
    setImageUrlInput('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: ProductDto) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      categoryId: p.categoryId,
      description: p.description || '',
      unit: p.unit,
      price: p.price?.price || 0,
      currency: p.price?.currency || 'UZS',
      inStock: p.price?.inStock ?? true,
      imageUrls: p.imageUrls?.length > 0 ? p.imageUrls : ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&auto=format&fit=crop&q=80'],
      attributes: (p.attributes as Record<string, string | number | boolean>) || {},
      isActive: p.isActive
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    } else {
      await createProduct(formData);
      setIsAddModalOpen(false);
    }
  };

  const handleAddAttribute = () => {
    if (!attrKey.trim() || !attrValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrKey.trim()]: attrValue.trim()
      }
    }));
    setAttrKey('');
    setAttrValue('');
  };

  const handleRemoveAttribute = (key: string) => {
    setFormData((prev) => {
      const next = { ...prev.attributes };
      delete next[key];
      return { ...prev, attributes: next };
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleQuickSavePrice = async (p: ProductDto) => {
    const newPrice = inlinePriceMap[p.id] ?? p.price?.price ?? 0;
    const inStock = p.price?.inStock ?? true;
    setIsSavingPriceId(p.id);
    await updateQuickPrice(p.id, newPrice, inStock);
    setIsSavingPriceId(null);
  };

  const handleToggleStock = async (p: ProductDto) => {
    const currentPrice = inlinePriceMap[p.id] ?? p.price?.price ?? 0;
    const nextStock = !(p.price?.inStock ?? true);
    await updateQuickPrice(p.id, currentPrice, nextStock);
  };

  const handleToggleActive = async (p: ProductDto) => {
    await updateProduct(p.id, { isActive: !p.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mahsulotlar Katalogi</h1>
          <p className="text-xs text-stone-400">
            Do‘koningizdagi barcha qurilish va pardozlash materiallarini boshqaring
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
        >
          <IconPlus className="w-4 h-4" />
          <span>Yangi mahsulot qo‘shish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mahsulot nomi, o'lchov yoki tavsif bo'yicha qidiruv..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 text-stone-200 placeholder-stone-500 border border-stone-700/80 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-stone-800 text-stone-200 border border-stone-700/80 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameUz}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="w-full md:w-48">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl bg-stone-800 text-stone-200 border border-stone-700/80 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Ombor holati: Barchasi</option>
            <option value="inStock">Faqat omborda bor</option>
            <option value="outOfStock">Zaxirasi tugagan</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-800/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Mahsulot</th>
                <th className="py-3.5 px-4 font-semibold">Kategoriya & O‘lchov</th>
                <th className="py-3.5 px-4 font-semibold">Narx (UZS)</th>
                <th className="py-3.5 px-4 font-semibold text-center">Ombor holati</th>
                <th className="py-3.5 px-4 font-semibold text-center">Faollik</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-500">
                    Mos keluvchi mahsulotlar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const currentPrice = inlinePriceMap[p.id] ?? p.price?.price ?? 0;
                  const isDirty = inlinePriceMap[p.id] !== undefined && inlinePriceMap[p.id] !== p.price?.price;

                  return (
                    <tr key={p.id} className="hover:bg-stone-800/40 transition-colors">
                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrls[0] || 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=100&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover bg-stone-800 border border-stone-700/60 shrink-0"
                          />
                          <div className="truncate max-w-[220px]">
                            <p className="font-bold text-white text-xs truncate" title={p.name}>
                              {p.name}
                            </p>
                            <p className="text-[11px] text-stone-400 truncate">
                              ID: {p.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Unit */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px] font-medium border border-stone-700/60 mb-1 truncate max-w-[180px]">
                          {cat?.nameUz || 'Kategoriya'}
                        </span>
                        <p className="text-[11px] text-stone-400">
                          Birligi: <strong className="text-stone-200">{p.unit}</strong>
                        </p>
                      </td>

                      {/* Price + Quick Edit */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) =>
                              setInlinePriceMap((prev) => ({
                                ...prev,
                                [p.id]: Number(e.target.value)
                              }))
                            }
                            className="w-28 px-2 py-1 rounded-lg bg-stone-800 text-amber-400 font-bold border border-stone-700 focus:outline-none focus:border-amber-500 text-xs"
                          />
                          {isDirty && (
                            <button
                              onClick={() => handleQuickSavePrice(p)}
                              disabled={isSavingPriceId === p.id}
                              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow"
                              title="Narxni saqlash"
                            >
                              <IconCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Stock Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            p.price?.inStock
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60'
                              : 'bg-rose-950/70 text-rose-400 border-rose-800/80 hover:bg-rose-900/60'
                          }`}
                        >
                          {p.price?.inStock ? 'Omborda bor' : 'Tugagan'}
                        </button>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${
                            p.isActive
                              ? 'bg-amber-500 border-amber-500 text-stone-950'
                              : 'border-stone-600 bg-stone-800'
                          }`}
                          title={p.isActive ? 'Faol mahsulot' : 'Faol emas'}
                        >
                          {p.isActive && <IconCheck className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
                            title="Tahrirlash"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                            title="O‘chirish"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo‘shish'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Flizelinli Oboy Venetsiya Klassik"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category and Unit in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Kategoriya *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameUz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    O‘lchov birligi *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Narxi (UZS) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-200">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 bg-stone-800 border-stone-700 focus:ring-0"
                    />
                    <span>Omborda bor</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-200">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 bg-stone-800 border-stone-700 focus:ring-0"
                    />
                    <span>Faol ko‘rsatish</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Tavsif</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mahsulot haqida batafsil ma'lumot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Image URLs */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300">Rasm havolasi (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700"
                  >
                    Qo‘shish
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.imageUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-stone-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center text-white text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Attributes (jsonb) */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <label className="block text-xs font-semibold text-stone-300">
                  Xususiyatlar (Atributlar)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attrKey}
                    onChange={(e) => setAttrKey(e.target.value)}
                    placeholder="Kalit (masalan: rang)"
                    className="w-1/3 px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={attrValue}
                    onChange={(e) => setAttrValue(e.target.value)}
                    placeholder="Qiymat (masalan: Oq emal)"
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(formData.attributes).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 text-xs"
                    >
                      <strong className="text-amber-400">{k}:</strong> {String(v)}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(k)}
                        className="text-stone-400 hover:text-rose-400 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  {editingProduct ? 'O‘zgarishlarni saqlash' : 'Mahsulotni yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Mahsulotni o‘chirish</h3>
            <p className="text-xs text-stone-300">
              «<strong>{deleteCandidate.name}</strong>» mahsulotini o‘chirib tashlamoqchimisiz? Bu
              amalni qaytarib bo‘lmaydi.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  await deleteProduct(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Ha, o‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
