# AI provayder taqqoslash — 1-bosqich natijasi

**Ega:** Abdunazar (4-modul) · **Sana:** 2026-08-19 · IMORA_TZ §7 1-bosqich va §11 2-savolga javob

> Narxlar 2026-08-18 da har provayderning **rasmiy** narx sahifasidan olindi.
> Rasm modellari narxi 2026 yilda bir necha marta o'zgardi — ishga tushirishdan
> oldin qayta tekshiring.

---

## 1. Qisqa javob

| Vaziyat | Provayder | Nega |
|---|---|---|
| Kundalik ishlab chiqish | `stub` | Pul yo'q, kalit yo'q, internet yo'q. Butun oqim ishlaydi |
| Bepul real sinov | `cloudflare` | Kuniga 10 000 Neuron bepul, karta so'ramaydi |
| Sifatni birinchi baholash | `fal` (FLUX.1 Kontext Pro) | Ro'yxatdan o'tganda kredit beriladi, xona geometriyasini eng yaxshi saqlaydi |
| Ishga tushirish (production) | `gemini` (2.5 Flash Image) | Geometriyani saqlaydiganlar ichida eng arzoni — $0.039/rasm |

Kod `AI_PROVIDER` orqali almashtiriladi — hech qanday kod o'zgarmaydi.

---

## 2. Narx jadvali

Bitta so'rov = **3 variant** (AC-08), shuning uchun "so'rov narxi" = rasm narxi × 3.

| Provayder / model | 1 rasm | 1 so'rov (3 variant) | Geometriyani saqlaydimi | Bepul limit |
|---|---:|---:|---|---|
| `stub` | $0 | $0 | ✖ (haqiqiy emas) | cheksiz |
| Cloudflare FLUX-1 Schnell | $0.0006 | **$0.0018** | ✖ text-to-image | 10 000 Neuron/kun |
| Gemini 3.1 Flash Lite Image | $0.0336 | $0.1008 | ✔ | ✖ yo'q |
| **Gemini 2.5 Flash Image** | **$0.039** | **$0.117** | ✔ | ✖ yo'q |
| fal FLUX.1 Kontext Pro | $0.04 | $0.12 | ✔ (eng yaxshi) | ro'yxatdan o'tish krediti |
| Gemini 3.1 Flash Image | $0.067 | $0.201 | ✔ | ✖ yo'q |
| Gemini 3 Pro Image | $0.134 | $0.402 | ✔ | ✖ yo'q |

**Muhim ikkita fakt:**

1. **Gemini rasm modellarida bepul tarif yo'q.** Google o'z narx sahifasida
   barcha rasm generatsiya modellarini faqat pullik tarifga qo'ygan. Birinchi
   chaqiruvdan pul ketadi.
2. **Imagen 4 o'chirildi** (2026-08-17). Eng arzon variant sifatida hisobga
   olmang.

---

## 3. Bu bizga qancha turadi

`AI_DAILY_BUDGET_USD` — kunlik qattiq chegara. Standart qiymati **$1**.

| Stsenariy | So'rovlar | Cloudflare | Gemini 2.5 Flash | fal Kontext |
|---|---:|---:|---:|---:|
| Standart kunlik chegara ($1) | — | 555 so'rov | **8 so'rov** | 8 so'rov |
| 7 kunlik sinov (tanqidiy tahlil §6): 100 kishi × 1 rasm | 100 | $0.18 | **$11.70** | $12.00 |
| Yopiq sinov: 30 foydalanuvchi × 3 so'rov | 90 | $0.16 | $10.53 | $10.80 |
| Oyiga 1 000 so'rov | 1 000 | $1.80 | $117 | $120 |
| Oyiga 10 000 so'rov | 10 000 | $18 | $1 170 | $1 200 |

Xulosa: **$100 lik 7 kunlik sinov Gemini bilan bemalol ko'tariladi** ($11.70).
Oylik 10 000 so'rov esa yon loyiha byudjetidan tashqarida — o'sish boshlansa
model narxini qayta ko'rib chiqish kerak, `AI_MODEL` bilan Flash Lite'ga
(-14%) tushish yoki batch API (-50%) ni o'rganish mumkin.

---

## 4. Sifat — nega Kontext va Gemini

Imora foydalanuvchining **o'z xonasini** qayta bezaydi. Agar model devor,
deraza va eshik joyini o'zgartirsa, chiqqan rasm bo'yicha mol tanlab bo'lmaydi —
mahsulotning butun ma'nosi yo'qoladi.

- **FLUX.1 Kontext** — tahrirlash modeli: xona rasmini to'liq kirish sifatida
  oladi, img2img "ishora" sifatida emas. Geometriyani eng ishonchli saqlaydi.
- **Gemini 2.5 Flash Image** — "arxitekturani saqla, faqat pardozni o'zgartir"
  turidagi ko'rsatmalarni yaxshi bajaradi va 2 barobar arzon.
- **Cloudflare FLUX-1 Schnell** — text-to-image. Yuklangan rasmni **umuman
  ko'rmaydi**. Quvurni bepul tekshirish uchun yaxshi, mahsulot uchun yaramaydi.
  Kod buni `preservesRoomStructure: false` bilan belgilaydi.

---

## 5. Kalitni qanday olish

Hech qanday to'lov ma'lumoti kiritilmagan — akkauntlarni jamoaning o'zi ochadi.

**Cloudflare (bepul, kartasiz):**
1. dash.cloudflare.com — ro'yxatdan o'tish
2. Workers & Pages → AI → Account ID ni nusxalash
3. My Profile → API Tokens → "Workers AI" shabloni bilan token yaratish
4. `.env`: `AI_PROVIDER=cloudflare`, `AI_API_KEY=<token>`,
   `AI_CLOUDFLARE_ACCOUNT_ID=<account id>`

**fal.ai (ro'yxatdan o'tish krediti):**
1. fal.ai → sign up → Keys → yangi kalit
2. `.env`: `AI_PROVIDER=fal`, `AI_API_KEY=<key>`

**Google Gemini (pullik, birinchi chaqiruvdan):**
1. aistudio.google.com → Get API key
2. Billing yoqilgan loyiha kerak
3. `.env`: `AI_PROVIDER=gemini`, `AI_API_KEY=<key>`
4. **Avval `AI_DAILY_BUDGET_USD` ni qo'ying** — keyin emas

> Kalit hech qachon repoga tushmasin (IMORA_TZ §9). Faqat `.env`, u gitignore'da.

---

## 6. Ochiq savollar (jamoa hal qilsin)

1. **Kim to'laydi?** Gemini'da bepul tarif yo'q. Birinchi real sinov uchun
   kimning kartasi ishlatiladi va limit qancha?
2. **$1/kun yetarlimi?** Standart chegara 8 so'rov/kun. Yopiq sinovda 20-30
   foydalanuvchi bo'lsa (§10), bu bir kunda tugaydi. Sinov kuni uchun
   `AI_DAILY_BUDGET_USD` ni ataylab ko'tarish kerak.
3. **Bepul limit foydalanuvchiga qancha?** Hozir `AI_USER_DAILY_LIMIT=5`.
   Tanqidiy tahlil §5 ga ko'ra retention shu raqamga bog'liq — sinovdan
   oldin kelishilsin.

---

## 7. Manbalar

- Google Gemini API narxlari — https://ai.google.dev/gemini-api/docs/pricing
- Cloudflare Workers AI narxlari — https://developers.cloudflare.com/workers-ai/platform/pricing/
- fal.ai narxlari — https://fal.ai/pricing

Gemini va Cloudflare raqamlari rasmiy sahifadan tasdiqlangan. fal'ning
ro'yxatdan o'tish krediti hajmi ikkinchi darajali manbalardan — akkaunt
ochilganda aniq raqam yozib qo'yilsin.
