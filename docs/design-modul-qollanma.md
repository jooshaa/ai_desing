# Imora — AI dizayn moduli (4-modul, Abdunazar)

**Sana:** 2026-08-19 · **Holat:** TZ §4 bo'yicha tugallangan, `main` ga push qilingan

---

## 1. Qisqacha: nima ishlaydi

Xona rasmi yuklanadi → tekshiriladi → navbatga qo'yiladi → tashqi AI API →
3 ta dizayn varianti + material teglari.

TZ §4 da menga berilgan **5 ta vazifa** — hammasi bajarildi:

| TZ talabi | Holat |
|---|---|
| Rasm yuklash → validatsiya → navbat → tashqi AI API → saqlash | ✅ |
| Uslub kutubxonasi va promptlar | ✅ 6 ta uslub |
| Xarajat nazorati (kunlik limit, foydalanuvchi limiti) | ✅ + pul chegarasi |
| AI ishlamay qolganda fallback | ✅ AC-10 tekshirilgan |
| Natijadan material teglarini ajratish | ✅ o'zbekcha nomlar bilan |

**Tekshirilgan qabul mezonlari:** AC-08 (3 dizayn, 90 soniyada), AC-09 (material
teglari), AC-10 (AI o'lsa ham ilova ishlaydi), AC-11 (limit tugasa bloklanadi),
AC-15 (migratsiyalar toza bazada birinchi urinishda).

**Testlar:** 79 ta unit test, typecheck va prettier — hammasi o'tadi.

---

## 2. Ishga tushirish (noldan)

Docker kerak emas. Redis kerak emas. Faqat Postgres.

### 2.1. Kod va paketlar

```bash
git pull origin main
pnpm install
```

### 2.2. Baza

Postgres 16+ o'rnatilgan bo'lsin. Keyin bir marta:

```bash
psql -U postgres -h localhost -c "CREATE ROLE imora LOGIN PASSWORD 'imora'; CREATE DATABASE imora OWNER imora;"
```

### 2.3. `.env` — DIQQAT, eng ko'p vaqt yeydigan joy

**Ikkita** nusxa kerak. Backend `backend/` papkasidan ishga tushadi va
`.env` ni **o'sha yerdan** o'qiydi — repo ildizidagi `.env` ni ko'rmaydi:

```bash
cp .env.example .env
cp .env.example backend/.env
```

`backend/.env` ichida quyidagilar turishi kerak:

```
NODE_ENV=development
AI_PROVIDER=stub
DESIGN_QUEUE_DRIVER=inline
DESIGN_DEV_USER_ID=11111111-1111-4111-8111-111111111111
```

> `AI_PROVIDER=stub` — kalit kerak emas, pul ketmaydi, internet kerak emas.
> Butun oqim ishlaydi, faqat rasm o'rniga kulrang "IMORA STUB" kartochkasi chiqadi.
> Haqiqiy rasm uchun 6-bo'limga qarang.

### 2.4. Migratsiya va ishga tushirish

```bash
pnpm --filter @imora/backend migration:run
```

```bash
cd backend && npx nest start --watch
```

Log'da shu ikki qator chiqsa — hammasi joyida:

```
[AiProvider] AI provider: stub (model stub, $0/image, ...)
[DesignQueue] Design queue driver: inline (no Redis; ...)
```

---

## 3. Sinash — playground

Brauzerda oching:

**http://localhost:3001/api/design/dev**

Xona rasmini tanlang → "Generate 3 designs" → natija chiqadi:
3 ta variant, ostida o'zbekcha material teglari, tepasida **necha soniya
kutganingiz** va **narxi**.

> Bu **vaqtinchalik** sahifa, faqat sinov uchun. Haqiqiy UI — Sarvarbekning
> `web-user/` ilovasi. Men uning papkasiga tegmadim (TZ §4 — egalik qoidasi).
> `NODE_ENV=development` bo'lmasa bu sahifa 404 qaytaradi.

---

## 4. API — Sarvarbek uchun

Shartnoma: `contracts/design.openapi.yaml` (v0.2.0). Mock server:

```bash
npx @stoplight/prism-cli mock contracts/design.openapi.yaml -p 4010
```

| Metod | Yo'l | Auth | Izoh |
|---|---|---|---|
| GET | `/design/styles` | – | 6 uslub, `nameUz` bilan |
| GET | `/design/quota` | ✔ | Bugun nechta bepul so'rov qolgani |
| POST | `/design/requests` | ✔ | multipart: `image` + `style`; **202** yoki **402** |
| GET | `/design/requests` | ✔ | Foydalanuvchining so'nggi so'rovlari |
| GET | `/design/requests/:id` | ✔ | Holat + variantlar (**shuni poll qiling**) |
| GET | `/design/variants/:id/materials` | – | Teglar |

**Oqim:** POST → `202` va `status: "queued"` → `/design/requests/:id` ni har
~1 soniyada so'rang → `status` `done` yoki `failed` bo'lguncha.

**Muhim — kutish vaqti:** Cloudflare klein'da **9–15 soniya**. Bu "spinner
aylanadi" degani emas — foydalanuvchi haqiqatan kutadi. Iltimos progress
ko'rsatgich qo'ying, aks holda ilova qotgandek ko'rinadi.

**Xato kodlari:**
- `400` — rasm yo'q, format noto'g'ri (faqat JPEG/PNG/WebP), yoki 10 MB dan katta
- `402` — kunlik bepul limit yoki byudjet tugagan (AC-11). Xabar `message` da
- `404` — begona foydalanuvchining so'rovi (ataylab 403 emas)

---

## 5. Material teglari — Shohjahon uchun

Men **faqat teg beraman**, katalogga bog'lash sizning ishingiz
(TZ §6: «Bu bog'lanish 3-dasturchining ishi, 4-dasturchi faqat teg beradi»).

**Teg formati:** `<yuza>.<material>.<tus>`

```
wall.wallpaper.warm-beige     →  "devor: oboy, iliq bej"
floor.parquet.walnut          →  "pol: parket, yong'oq"
ceiling.moulding.white        →  "shift: karniz, oq"
wall.tile.glossy-white        →  "devor: kafel, yaltiroq oq"
```

`design_materials.tag` ustuni `product_tags.tag` bilan bir xil nom fazosida —
to'g'ridan-to'g'ri join qilsa bo'ladi. Indeks qo'yilgan.

Hozir 6 uslub × 3 teg + xona turiga qarab qo'shimcha (hammom, oshxona uchun
kafel). AC-09 sizning qismingiz tayyor bo'lganda to'liq yopiladi.

---

## 6. AI provayder va narx

Kod hech qachon o'zgarmaydi — faqat `.env`.

| Provayder | 1 so'rov (3 variant) | Bepulmi | Xona geometriyasini saqlaydimi |
|---|---|---|---|
| `stub` | $0 | ✅ doim | ✖ (soxta rasm) |
| **`cloudflare`** ← hozir | **$0.0027** | ✅ 10 000 Neuron/kun | ✅ |
| `gemini` | $0.117 | ✖ bepul tarif yo'q | ✅ |
| `fal` | $0.120 | ro'yxatdan o'tish krediti | ✅ |

### Cloudflare (bepul, karta so'ramaydi)

1. dash.cloudflare.com → ro'yxatdan o'ting
2. **AI → Workers AI** → "Use REST API" → token yarating
3. URL'dagi `/accounts/<HEX>/` — bu Account ID
4. `backend/.env` ga yozing:

```
AI_PROVIDER=cloudflare
AI_MODEL=cloudflare-flux-2-klein-4b
AI_API_KEY=<token>
AI_CLOUDFLARE_ACCOUNT_ID=<hex>
```

> **Kalit hech qachon repoga tushmaydi.** `.env` — gitignore'da, git uni
> ko'rmaydi ham. `.env.example` da faqat bo'sh joy turadi. Push qilishdan
> oldin hech narsani almashtirish kerak emas.

**Pul ketadimi?** Yo'q. Bepul tarifda karta biriktirilmagan — 10 000 Neuron
tugasa so'rov shunchaki **xato qaytaradi**, hisob kelmaydi. Pul faqat siz
o'zingiz Workers Paid ($5/oy) ga o'tsangiz boshlanadi.

---

## 7. Limitlar

`backend/.env` dagi sozlamalar:

| O'zgaruvchi | Hozir | Ma'nosi |
|---|---|---|
| `AI_VARIANT_COUNT` | 3 | Har so'rovga nechta rasm (AC-08) |
| `AI_USER_DAILY_LIMIT` | 5 | Bitta foydalanuvchi kuniga nechta **so'rov** |
| `AI_DAILY_LIMIT` | 35 | Hammasi bo'lib kuniga nechta so'rov |
| `AI_DAILY_BUDGET_USD` | 1 | Kunlik qattiq pul chegarasi. `-1` = o'chirilgan |

**Muhim tushuncha:** TZ da **3** raqami — bu *bitta yuklashga 3 ta variant*,
"3 ta bepul yuklash" emas. 1 yuklash = 3 ta rasm = 3 marta to'lov.

TZ da bepul limit raqami **umuman yozilmagan** (AC-11 faqat "limit bo'lsin"
deydi). Va **onlayn to'lov MVP ga kirmaydi** — ya'ni hech kimdan pul
so'ralmaydi, limit tugasa "ertaga keling" deb bloklanadi. Raqamni jamoa
o'zi tanlaydi.

Cloudflare bepul tarifi ≈ **kuniga 35 so'rov** (10 000 Neuron ÷ ~251).
Har kuni yangilanadi.

---

## 8. Ko'p vaqt yeydigan uchta xato

1. **`backend/.env` yo'q** → ilova ildizdagi `.env` ni o'qimaydi. Ikkalasiga ham nusxa qiling.
2. **`Cannot find module dist/main`** → eski `.tsbuildinfo`. Yechim:
   `rm -f backend/*.tsbuildinfo` va qayta ishga tushiring.
3. **`pnpm format:check` 150 ta faylda yiqiladi** → Windows'da `core.autocrlf=true`
   va `.gitattributes` yo'qligidan. Kod buzilmagan.
   **`prettier --write .` ni ishlatmang** — butun jamoaning fayllarini qayta yozadi.
   Faqat o'z fayllaringizni formatlang.

---

## 9. Keyingi ishlar

- **Promptlarni sozlash** — haqiqiy o'zbek xonalari rasmlarida sinash. Ayniqsa
  *milliy* uslub: so'zana, o'ymakor shift chiqyaptimi? Bu mening ishim.
- **Bull navbati** — Redis paydo bo'lganda `DESIGN_QUEUE_DRIVER=bull` sinash.
- **Realizm sinovi** — tanqidiy tahlil §5 ga ko'ra "bu montaj-ku" degan reaksiya
  g'oyani o'ldiradi. Klein natijasi kutilganidan ancha yaxshi chiqdi, lekin buni
  haqiqiy foydalanuvchilar aytishi kerak, biz emas.

**Batafsil:** `backend/src/design/README.md` (texnik), `docs/design-ai-providers.md`
(narx va provayder taqqoslash).
