'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/storeContext';
import { ImportPreviewRow } from '../../lib/types';
import {
  IconUpload,
  IconDownload,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconProducts,
  IconSparkles
} from '../../components/icons';

const SAMPLE_CSV_CONTENT = `Nomi,Kategoriya,O'lchov birligi,Narxi,Omborda (Ha/Yo'q),Tavsifi,Teglar
"Flizelinli Oboy Erismann 10m","Devor qoplamalari va Oboylar","rulon",235000,"Ha","Germaniya sifati, yuviladigan och kulrang oboy","devor, oboy, kulrang"
"Laminat Kastamonu Floorpan 32-sinf","Pol qoplamalari (Laminat, Parket)","m2",125000,"Ha","8mm qalinlikdagi eman daraxti naqshli laminat","pol, laminat, eman"
"Granit Kafel Kerama Marazzi 60x60","Keramik plitka va Kafel","m2",210000,"Ha","Pol uchun silliq, suv o'tkazmaydigan kafel","kafel, granit, plitka"
"Bo'yoq Marshall Akrikor Fasad (15L)","Bo'yoqlar va Gruntovkalar","dona",480000,"Ha","Tashqi fasad uchun atmosfera ta'siriga chidamli bo'yoq","fasad, boyoq, oq"
"Santexnika Dush Ustuni Rozin LED","Santexnika va Vanna jihozlari","komplekt",1850000,"Ha","Termostatli va gidromassajli zamonaviy dush paneli","santexnika, dush"
"LED Lyustra Loft Ring 72W","Yoritish va Elektr jihozlari","dona",620000,"Ha","Pult va ilova orqali boshqariladigan 3 xil yorug'lik rejimi","chiroq, lyustra, led"
"Gipsokarton Knauf 9.5mm Shift uchun","Devor qoplamalari va Oboylar","dona",58000,"Ha","Shiftga mo'ljallangan yengil va mustahkam gipsokarton","gipsokarton, knauf, shift"
"DSP Plita Laminatsiyalangan 16mm","Pol qoplamalari (Laminat, Parket)","dona",340000,"Ha","Mebel va pol tagligi uchun sifatli DSP","dsp, mebel"
"Almaz Diska 125mm Granit kesish uchun","Keramik plitka va Kafel","dona",75000,"Ha","Kafel va plitkalarni qirqish uchun uzoq muddatli disk","almaz, asbob"
"Gruntovka Knauf Tiefengrund 10L","Bo'yoqlar va Gruntovkalar","dona",145000,"Ha","Devorni mustahkamlovchi chuqur singuvchi gruntovka","gruntovka, knauf"`;

export default function ImportPage() {
  const { categories, importProducts, addToast } = useStore();
  const router = useRouter();

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'imora_mahsulotlar_shablon.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Namuna CSV shabloni yuklab olindi');
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== '');
    if (lines.length < 2) {
      addToast('Fayl bo‘sh yoki noto‘g‘ri formatda', 'error');
      return;
    }

    const rows: ImportPreviewRow[] = [];

    // Simple robust CSV line parser respecting quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const header = parseLine(lines[0]);

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length < 4) continue;

      const name = cols[0]?.replace(/^["']|["']$/g, '').trim();
      const categoryName = cols[1]?.replace(/^["']|["']$/g, '').trim();
      const unit = cols[2]?.replace(/^["']|["']$/g, '').trim() || 'dona';
      const rawPrice = cols[3]?.replace(/[^0-9.]/g, '');
      const price = Number(rawPrice) || 0;
      const rawInStock = cols[4]?.toLowerCase();
      const inStock = rawInStock ? rawInStock.includes('ha') || rawInStock.includes('yes') || rawInStock.includes('1') || rawInStock.includes('true') : true;
      const description = cols[5]?.replace(/^["']|["']$/g, '').trim() || '';
      const tags = cols[6]?.replace(/^["']|["']$/g, '').trim() || '';

      const errors: string[] = [];
      if (!name) errors.push('Nomi kiritilmagan');
      if (price <= 0) errors.push('Narx noto‘g‘ri yoki 0');

      const matchedCategory = categories.find(
        (c) =>
          c.nameUz.toLowerCase().includes(categoryName.toLowerCase()) ||
          categoryName.toLowerCase().includes(c.nameUz.toLowerCase())
      );

      rows.push({
        name,
        categoryName: categoryName || 'Umumiy',
        categoryId: matchedCategory?.id || categories[0]?.id || 'cat-1',
        unit,
        price,
        inStock,
        description,
        tags,
        isValid: errors.length === 0,
        errors
      });
    }

    setPreviewRows(rows);
    addToast(`${rows.length} ta mahsulot muvaffaqiyatli o‘qildi`);
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleStartImport = async () => {
    const validRows = previewRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      addToast('Import qilish uchun to‘g‘ri mahsulotlar topilmadi', 'error');
      return;
    }

    setIsImporting(true);
    setImportProgress(25);

    setTimeout(async () => {
      setImportProgress(75);
      await importProducts(validRows);
      setImportProgress(100);
      setIsImporting(false);
      router.push('/products');
    }, 800);
  };

  const validCount = previewRows.filter((r) => r.isValid).length;
  const invalidCount = previewRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Ommaviy Excel / CSV Import (AC-03)
          </h1>
          <p className="text-xs text-stone-400">
            Do‘koningizdagi yuzlab mahsulotlarni bir marta Excel yoki CSV fayl orqali yuklang
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-all shadow-sm"
        >
          <IconDownload className="w-4 h-4 text-amber-400" />
          <span>Shablonni yuklab olish (CSV)</span>
        </button>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
          dragActive
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-stone-800 hover:border-stone-700 bg-stone-900/60'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv,.txt,.xlsx,.xls"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-800 text-amber-400 flex items-center justify-center border border-stone-700 shadow-md">
            <IconUpload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-white">
              {fileName ? fileName : 'Excel yoki CSV faylni shu yerga tashlang'}
            </p>
            <p className="text-xs text-stone-400">
              Yoki kompyuterdan tanlash uchun quyidagi tugmani bosing
            </p>
          </div>

          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <IconProducts className="w-4 h-4" />
            <span>Faylni tanlash</span>
          </label>

          <p className="text-[11px] text-stone-500">
            Qo‘llab-quvvatlanadigan formatlar: .CSV, .XLSX, .TXT (UTF-8) · Maksimal hajm: 25MB (10,000+ qator)
          </p>
        </div>
      </div>

      {/* Preview Table */}
      {previewRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-stone-300">
                Jami topildi: <strong className="text-white">{previewRows.length} ta</strong>
              </span>
              <span className="text-emerald-400 font-semibold">
                ✓ To‘g‘ri qatorlar: {validCount} ta
              </span>
              {invalidCount > 0 && (
                <span className="text-rose-400 font-semibold">
                  ⚠ Xatoli qatorlar: {invalidCount} ta
                </span>
              )}
            </div>

            <button
              onClick={handleStartImport}
              disabled={isImporting || validCount === 0}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all"
            >
              <IconCheck className="w-4 h-4" />
              <span>
                {isImporting
                  ? `Yuklanmoqda (${importProgress}%)...`
                  : `${validCount} ta mahsulotni katalogga qo‘shish`}
              </span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="sticky top-0 bg-stone-800 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Holat</th>
                    <th className="py-3 px-4 font-semibold">Nomi</th>
                    <th className="py-3 px-4 font-semibold">Kategoriya</th>
                    <th className="py-3 px-4 font-semibold">O‘lchov</th>
                    <th className="py-3 px-4 font-semibold">Narxi</th>
                    <th className="py-3 px-4 font-semibold">Zaxira</th>
                    <th className="py-3 px-4 font-semibold">Teglar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {previewRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.isValid ? 'hover:bg-stone-800/40' : 'bg-rose-950/20 text-rose-300'
                      }
                    >
                      <td className="py-2.5 px-4">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                            <IconCheck className="w-3.5 h-3.5" /> Tayyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-bold">
                            <IconAlertTriangle className="w-3.5 h-3.5" /> {row.errors.join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-white max-w-[200px] truncate">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-4 text-stone-400 max-w-[150px] truncate">
                        {row.categoryName}
                      </td>
                      <td className="py-2.5 px-4 text-stone-300">{row.unit}</td>
                      <td className="py-2.5 px-4 font-bold text-amber-400">
                        {row.price.toLocaleString()} UZS
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.inStock
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {row.inStock ? 'Omborda bor' : 'Yo‘q'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-stone-400 max-w-[160px] truncate">
                        {row.tags || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
