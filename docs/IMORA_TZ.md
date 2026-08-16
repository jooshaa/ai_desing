# Imora — Texnik topshiriq (MVP)

**Versiya:** v1.0 · **Sana:** 2026-08-12
**Jamoa:** 6 dasturchi · **Muddat:** belgilanmagan, bosqichlar bo'yicha baholangan

> Bu hujjatning asosiy maqsadi — 6 kishi **bir-birini kutmasdan va bir faylda
> to'qnashmasdan** parallel ishlashi. Shuning uchun har bo'limda "kim egasi"
> va "chegara qayerda" aniq yozilgan.

---

## 1. Mahsulot nima qiladi

Uy qurayotgan yoki ta'mir qilayotgan odam uchun bitta ilova:

1. **Xona rasmini yuklaydi** → AI 3 ta dizayn varianti beradi (uslub tanlash bilan)
2. **Dizaynga qarab material tanlaydi** → tizim katalogdan mos mahsulotlarni topadi
3. **Narxlarni solishtiradi** → qaysi do'konda qancha turishini ko'radi
4. **Buyurtma beradi** → do'kon qabul qiladi, yetkazib beradi

Do'kon tomonida: **o'z mahsulot va narxlarini o'zi kiritadi** — veb panel yoki
Telegram bot orqali.

### MVP ga KIRADI

- Foydalanuvchi ro'yxati va kirishi (telefon + SMS)
- Xona rasmi → AI dizayn (3 variant, uslub tanlash bilan) — **soddalashtirilgan**
- Dizayn uchun material tavsiyalari (katalogdan)
- Katalog: kategoriya, mahsulot, narx, do'kon
- Narx solishtirish: bitta mahsulot — bir necha do'kon
- Savat va buyurtma (do'konga yuboriladi)
- Do'kon paneli (veb) — mahsulot va narx kiritish
- Telegram bot (do'kon uchun) — tez narx yangilash
- Admin panel — do'kon tasdiqlash, kategoriya boshqaruvi

### MVP ga KIRMAYDI (2-bosqich)

- Rasmdan mahsulot topish (vizual qidiruv, embedding)
- Segmentatsiya va "bosib tahrirlash" (devorni bosib rang almashtirish)
- Onlayn to'lov
- Ustalar bo'limi
- 3D, iqlim/quyosh tahlili
- Yetkazib berish logistikasi (buyurtma do'konga boradi, tashishni do'kon qiladi)

---

## 2. Texnologiya

| Qatlam | Tanlov | Izoh |
|---|---|---|
| Backend | **NestJS + TypeScript** | Jamoada tajriba bor |
| ORM | **TypeORM** | Har modul o'z entity'lari — Prisma'dagi bitta `schema.prisma` konflikti yo'q |
| Baza | **PostgreSQL 16** | |
| Kesh / navbat | **Redis + BullMQ** | AI so'rovlari navbat orqali |
| Fayl saqlash | **S3-mos storage** (MinIO / Cloudflare R2) | Rasm yuklash |
| Foydalanuvchi ilovasi | **Next.js + React + TypeScript + Tailwind** | Mobil-birinchi |
| Do'kon paneli | **Next.js** (alohida ilova) | |
| Bot | **Node.js + grammY** | |
| AI | Tashqi rasm-generatsiya API | O'z model o'qitilmaydi |
| Deploy | Docker + docker-compose, keyin VPS | |

> **Qoida:** TypeORM'da `synchronize: true` **hech qachon** ishlatilmaydi.
> Faqat migratsiya. Aks holda ikki kishi bazani bir-biriga qarshi o'zgartiradi.

---

## 3. Repozitoriy tuzilishi

Bitta monorepo (pnpm workspace), lekin **paketlar mustaqil**:

```
imora/
├── contracts/              # API shartnomalari — har modul o'ziniki
│   ├── auth.openapi.yaml
│   ├── catalog.openapi.yaml
│   ├── design.openapi.yaml
│   └── orders.openapi.yaml
├── packages/
│   └── shared-types/       # contracts'dan generatsiya qilinadi
├── backend/
│   └── src/
│       ├── core/           # Jo'shqin
│       ├── catalog/        # Abdumalik
│       ├── orders/         # Shohjahon
│       ├── design/         # Abdunazar
│       └── common/         # umumiy — qoida bilan (7-bo'limga qarang)
├── web-user/               # Sarvarbek
├── web-store/              # Otabek
└── bot-store/              # Otabek
```

---

## 4. Modullar va egalar

Har modulning **bitta egasi** bor. Ega o'z papkasidagi kodga javob beradi.

> Taqsimot **tasodifiy** qilingan — hech kimga imtiyoz yoki noqulaylik
> bo'lmasligi uchun. Jamoa kelishsa, o'zaro almashish mumkin (5-bo'limdagi
> qoidalar kimga qaysi modul tushishidan qat'i nazar amal qiladi).

| # | Kim | Rol | Modul | Papkalar |
|---|---|---|---|---|
| **1** | **Jo'shqin** | Tech Lead + PM + DevOps | **Core** | `backend/src/core/`, `contracts/auth.*`, CI/CD, deploy |
| **2** | **Abdumalik Najot** | Backend | **Katalog** | `backend/src/catalog/` |
| **3** | **Shohjahon NT** | Backend | **Buyurtma + Qidiruv** | `backend/src/orders/` |
| **4** | **Abdunazar** | Backend / AI | **AI dizayn** | `backend/src/design/` |
| **5** | **Sarvarbek Sodiqov** | Frontend | **Foydalanuvchi ilovasi** | `web-user/` |
| **6** | **Otabek** | Fullstack | **Do'kon paneli + bot** | `web-store/`, `bot-store/` |

### 1 — Jo'shqin · Tech Lead / PM / DevOps

**Kod:** Core moduli — foydalanuvchilar, rollar, autentifikatsiya (telefon + SMS kod),
JWT, refresh token, profil, manzillar.

**Koordinatsiya:**
- API shartnomalarini tasdiqlaydi (har modul o'zi yozadi, u ko'rib chiqadi)
- Umumiy fayllarga o'zgarish faqat uning tasdig'i bilan
- Har PR ni ko'rib chiqadi (review)
- Qamrovni qo'riqlaydi — "yana shu funksiyani qo'shaylik" ga YO'Q deydi

**DevOps:**
- Docker, docker-compose (postgres, redis, minio)
- GitHub/GitLab CI: lint + test + build har PR da
- Staging va production muhitlari
- Migratsiyalarni deploy'da avtomatik ishga tushirish
- `.env.example` va sirlar boshqaruvi

> **Nega u Core ni oladi:** Core'ga hamma tayanadi. Uni birinchi hafta tugatib,
> qolganlarni bloklamaslik kerak — bu eng mas'uliyatli qism.

### 2 — Abdumalik Najot · Katalog

Do'konlar, kategoriyalar, mahsulotlar, narxlar, o'lchov birliklari, rasm metadata.
Do'kon ma'lumot kiritish API'si (panel va bot shu API'ga murojaat qiladi).
Excel/CSV import. Kategoriya daraxti. Qidiruv indeksi.

### 3 — Shohjahon NT · Buyurtma + Qidiruv

Savat, buyurtma, buyurtma holatlari va tarixi.
**Narx solishtirish** — bitta mahsulot bir necha do'konda: eng arzoni, eng yaqini.
Dizayn materiallarini katalog mahsulotlariga bog'lash mantiqi.

### 4 — Abdunazar · AI dizayn

Rasm yuklash → validatsiya → navbatga qo'yish → tashqi AI API → natijani saqlash.
Uslub kutubxonasi va promptlar. Xarajat nazorati (kunlik limit, foydalanuvchi limiti).
AI ishlamay qolganda fallback. Natijadan material teglarini ajratish.

### 5 — Sarvarbek Sodiqov · Foydalanuvchi ilovasi

Kirish, xona rasmi yuklash oqimi, dizayn natijalari, material tavsiyalari,
katalog ko'rish, narx solishtirish, savat, buyurtma, "buyurtmalarim".

### 6 — Otabek · Do'kon paneli + Telegram bot

**Panel:** do'kon ro'yxatdan o'tishi, profil, mahsulot CRUD, narx yangilash,
Excel import, kelgan buyurtmalar, holat o'zgartirish.
**Bot:** tez narx yangilash, yangi buyurtma xabarnomasi, qabul/rad qilish.

---

## 5. Bir-birini kutmaslik — asosiy mexanizm

Bu TZ ning eng muhim qismi.

### 5.1. API shartnomasi birinchi

**0-hafta oxirigacha** har backend dasturchi o'z modulining OpenAPI faylini yozadi:
endpoint'lar, so'rov/javob shakllari, xato kodlari. Kod hali yo'q — faqat shartnoma.

Tech Lead ularni ko'rib chiqadi va tasdiqlaydi. **Shundan keyin frontend
backendni kutmaydi** — mock server ustida ishlaydi:

```bash
npx @stoplight/prism-cli mock contracts/catalog.openapi.yaml -p 4010
```

Shartnoma o'zgarsa — avval `contracts/*.yaml` yangilanadi va e'lon qilinadi,
keyin kod. Aksincha emas.

### 5.2. Entity egaligi

**Har entity aynan bitta modulga tegishli.** Boshqa modul unga faqat **ID orqali**
murojaat qiladi va egasining servisi orqali o'qiydi.

```ts
// ✅ TO'G'RI — orders moduli catalog'ga ID orqali murojaat qiladi
@Column() productId: string;

// ❌ NOTO'G'RI — orders moduli catalog entity'sini import qiladi
@ManyToOne(() => Product) product: Product;
```

Nega: aks holda ikki modul bitta entity faylini tahrirlaydi va har migratsiyada
to'qnashadi. ID orqali bog'lanish biroz ko'proq kod, lekin modullar mustaqil qoladi.

**Istisno:** Core'dagi `User` — hamma unga `ManyToOne` bilan bog'lana oladi
(faqat o'qish uchun, Core uni o'zgartirmaydi).

### 5.3. Migratsiyalar

Har dasturchi o'z moduli uchun migratsiya generatsiya qiladi:

```bash
pnpm typeorm migration:generate src/catalog/migrations/AddProductPrice
```

Fayl nomida **modul nomi va vaqt belgisi** bo'ladi — ikki migratsiya hech qachon
bir xil nomlanmaydi, konflikt bo'lmaydi.

### 5.4. Umumiy fayllar

Bu fayllarga tegish uchun **Tech Lead'ga aytish shart** (chatda bir qator yetadi):

- `backend/src/app.module.ts`
- `backend/src/common/**`
- `package.json`, `docker-compose.yml`, CI konfiguratsiyasi
- `packages/shared-types/**`

Qolgan hamma joyda ega o'zi qaror qiladi, so'ramaydi.

### 5.5. Branch va PR

```
main            ← faqat ishlaydigan kod
└── feat/catalog-product-crud     ← modul nomi bilan boshlanadi
```

- Branch **modul prefiksi** bilan: `feat/catalog-…`, `feat/orders-…`
- PR 400 qatordan oshmasin — katta PR review'ni o'ldiradi
- Har PR kamida 1 kishi tomonidan ko'rib chiqiladi (odatda Tech Lead)
- **Kuniga kamida bir marta `main` dan branch'ga `rebase`** — konfliktni kechiktirmaslik
- PR 2 kundan ko'p ochiq turmasin

### 5.6. Kundalik ritm

- **10 daqiqalik yozma standup** (Telegram guruhda): kecha nima, bugun nima, nima to'sib turibdi
- Haftalik 30 daqiqa: shartnoma o'zgarishlari va kelasi hafta rejasi
- "Bu kimning ishi?" savoli chiqsa — javob 4-bo'limda. Yo'q bo'lsa Tech Lead hal qiladi va TZ ga qo'shadi

---

## 6. Ma'lumotlar modeli (modullar bo'yicha)

### Core (1-dasturchi)

| Entity | Asosiy maydonlar |
|---|---|
| `User` | id, phone, name, role (user/store/admin), isActive, createdAt |
| `RefreshToken` | id, userId, token, expiresAt |
| `Address` | id, userId, region, district, text, lat/lng (ixtiyoriy) |
| `OtpCode` | id, phone, code, expiresAt, attempts |

### Katalog (2-dasturchi)

| Entity | Asosiy maydonlar |
|---|---|
| `Store` | id, name, ownerUserId, phone, region, districts[], status (pending/active/blocked), logoUrl |
| `Category` | id, parentId, nameUz, nameRu, slug, sort, icon |
| `Product` | id, storeId, categoryId, name, description, unit, imageUrls[], attributes (jsonb), isActive |
| `ProductPrice` | id, productId, price, currency, validFrom, inStock |
| `ProductTag` | id, productId, tag — AI material tavsiyasi shu orqali bog'lanadi |

> `attributes` jsonb: rang, o'lcham, material, naqsh — kategoriyaga qarab o'zgaradi.
> Har kategoriya uchun alohida jadval yasalmaydi.

### Buyurtma + Qidiruv (3-dasturchi)

| Entity | Asosiy maydonlar |
|---|---|
| `Cart` | id, userId, updatedAt |
| `CartItem` | id, cartId, productId, qty, priceSnapshot |
| `Order` | id, userId, storeId, addressId, status, total, note, createdAt |
| `OrderItem` | id, orderId, productId, qty, price, productNameSnapshot |
| `OrderStatusHistory` | id, orderId, oldStatus, newStatus, actorId, createdAt |

> **Snapshot muhim:** buyurtma berilgandan keyin do'kon narxni o'zgartirsa,
> buyurtmadagi narx o'zgarmasligi kerak.

**Buyurtma holatlari:**
```
NEW → CONFIRMED → PREPARING → DELIVERING → DELIVERED
                → CANCELLED (istalgan bosqichda, sabab bilan)
```

### AI dizayn (4-dasturchi)

| Entity | Asosiy maydonlar |
|---|---|
| `DesignRequest` | id, userId, inputImageUrl, roomType, style, note, status, apiCost, createdAt |
| `DesignVariant` | id, requestId, imageUrl, sort |
| `DesignMaterial` | id, variantId, tag, label — "devor: oboy, iliq bej" |

`DesignMaterial.tag` → `ProductTag.tag` orqali katalogga bog'lanadi.
Bu bog'lanish **3-dasturchining** ishi (qidiruv), 4-dasturchi faqat teg beradi.

---

## 7. Bosqichlar

Muddat belgilanmagan, shuning uchun **bosqich va natija** bo'yicha.

### 0-bosqich — Poydevor (≈1 hafta)

| Kim | Nima |
|---|---|
| Jo'shqin | Repo, monorepo skeleti, docker-compose (postgres/redis/minio), CI, `.env.example` |
| Jo'shqin | Core: User entity, migratsiya, telefon+SMS auth, JWT, rollar |
| Abdumalik, Shohjahon, Abdunazar | O'z modulining OpenAPI shartnomasini yozish |
| Sarvarbek, Otabek | Dizayn tizimi, sahifa skeletlari, mock server ustida ishlash boshlanadi |

**Natija:** hamma `main` dan `pnpm dev` qilib ishga tushira oladi. Shartnomalar tasdiqlangan.

### 1-bosqich — Katalog va do'kon (≈3 hafta)

| Kim | Nima |
|---|---|
| Abdumalik | Kategoriya daraxti, Product CRUD, narx, rasm yuklash, Excel import |
| Otabek | Do'kon paneli: ro'yxatdan o'tish, mahsulot qo'shish/tahrirlash, narx yangilash |
| Sarvarbek | Katalog ko'rish, kategoriya, mahsulot kartochkasi, qidiruv UI |
| Shohjahon | Savat, buyurtma yaratish, holatlar |
| Jo'shqin | Admin: do'kon tasdiqlash, kategoriya boshqaruvi |
| Abdunazar | AI API tanlash (2-3 provayder sinovi), narx/sifat jadvali, prompt tajribalari |

**Natija:** do'kon o'z mahsulotini kirita oladi, foydalanuvchi ko'rib buyurtma bera oladi.

### 2-bosqich — Narx solishtirish va bot (≈2 hafta)

| Kim | Nima |
|---|---|
| Shohjahon | Narx solishtirish: bir mahsulot — bir necha do'kon, saralash |
| Otabek | Telegram bot: narx yangilash, buyurtma xabarnomasi, qabul/rad |
| Sarvarbek | Buyurtma oqimi, "buyurtmalarim", holat kuzatuvi |
| Abdumalik | Qidiruv optimallashtirish, indekslar |
| Abdunazar | AI servis: yuklash → navbat → generatsiya → saqlash |

**Natija:** to'liq savdo oqimi ishlaydi.

### 3-bosqich — AI dizayn (≈2 hafta)

| Kim | Nima |
|---|---|
| Abdunazar | 3 ta variant, uslub tanlash, xarajat limitlari, fallback |
| Sarvarbek | Dizayn oqimi UI: rasm yuklash → uslub → kutish → natijalar |
| Shohjahon | Dizayn teglari → katalog mahsulotlari mosligi |
| Jo'shqin | Yuklama testi, monitoring |

**Natija:** rasm → dizayn → material → narx → buyurtma zanjiri to'liq.

### 4-bosqich — Sayqal va ishga tushirish (≈2 hafta)

Bildirishnomalar, xato holatlari, mobil sayqal, yopiq sinov, deploy.

---

## 8. Qabul mezonlari

| ID | Mezon |
|---|---|
| AC-01 | Foydalanuvchi telefon + SMS kod bilan ro'yxatdan o'tadi va kiradi |
| AC-02 | Do'kon panel orqali mahsulot qo'shadi, narx belgilaydi, u foydalanuvchi katalogida ko'rinadi |
| AC-03 | Do'kon Excel fayl orqali 100+ mahsulotni bir marta yuklaydi |
| AC-04 | Do'kon Telegram bot orqali mahsulot narxini yangilaydi |
| AC-05 | Foydalanuvchi bitta mahsulotni bir necha do'konda narx bo'yicha solishtiradi |
| AC-06 | Savat → buyurtma → do'konga xabar → holat o'zgarishi ishlaydi |
| AC-07 | Buyurtmadagi narx do'kon keyin narxni o'zgartirsa ham o'zgarmaydi |
| AC-08 | Foydalanuvchi xona rasmini yuklab, 90 soniyada 3 ta dizayn oladi |
| AC-09 | Dizayn ostida katalogdan material tavsiyalari va narxlari chiqadi |
| AC-10 | AI servis ishlamasa ham ilova ishlashda davom etadi |
| AC-11 | Bepul AI limiti tugagach yangi so'rov bloklanadi |
| AC-12 | Do'kon faqat o'z mahsuloti va buyurtmasini ko'radi |
| AC-13 | Admin do'konni tasdiqlaguncha uning mahsuloti katalogda ko'rinmaydi |
| AC-14 | Barcha sahifalar mobil brauzerda ishlaydi |
| AC-15 | Migratsiyalar toza bazada birinchi urinishda o'tadi |

---

## 9. Kod qoidalari

- **TypeScript strict** — `any` faqat izoh bilan
- **ESLint + Prettier** — CI da tekshiriladi, PR o'tmaydi
- Har modul o'z DTO'lariga ega, `class-validator` bilan
- Servis qatlami biznes mantiq, controller faqat HTTP
- Xatolar: global exception filter, bir xil formatda javob
- Log: har so'rovda `requestId`, xatoda stack
- Test: kritik biznes mantiqqa unit test (narx solishtirish, buyurtma holatlari, AI limit)
- **Sirlar hech qachon repoga tushmaydi** — faqat `.env`, `.env.example` da namuna

---

## 10. Kod yozilmaydigan, lekin bajarilishi shart ish

> Bu bo'lim ataylab TZ ichida. Bajaruvchisi belgilanmasa, MVP tayyor bo'ladi-yu,
> ko'rsatadigan narsa bo'lmaydi.

| Ish | Nega kritik | Muddat |
|---|---|---|
| **5-10 do'kon bilan kelishuv** | Katalog bo'sh bo'lsa ilova ishlamaydi | 1-bosqichgacha |
| Kategoriya daraxtini tuzish | Real bozorga mos bo'lishi kerak | 0-bosqich |
| Boshlang'ich katalog kontenti | Do'kon o'zi kiritmasa, biz kiritamiz | 1-bosqich |
| Yopiq sinov uchun 20-30 foydalanuvchi | Sinovsiz ishga tushirish — ko'r-ko'rona | 4-bosqich |

**Kim qiladi:** jamoadan biri (Tech Lead emas — u allaqachon band) yoki tashqaridan
odam. Bu qaror TZ ga kiritilishi kerak.

---

## 11. Ochiq savollar

Bular hal qilinmaguncha tegishli qismlar boshlanmaydi:

1. **SMS provayder** — Eskiz, Play Mobile yoki boshqa? Narxi va limiti?
2. **AI provayder** — 4-dasturchi 0-bosqichda 2-3 tasini sinab, taqqoslash jadvali beradi
3. **Fayl saqlash** — o'z serverida MinIO yoki Cloudflare R2?
4. **Domen va brend** — nom yakunlanmagan (`UY_STARTUP_NOM_TANLOVI.md` ga qarang), logo tanlanmagan
5. **Do'kon komissiyasi** — buyurtmadan foiz olinadimi yoki MVP da bepul?
6. **Yetkazib berish** — do'kon o'zi qiladimi, biz aralashamizmi?

---

## 12. Xavflar

| Xavf | Ta'siri | Nima qilamiz |
|---|---|---|
| Katalog bo'sh qoladi | MVP ko'rsatib bo'lmaydi | 10-bo'lim: do'kon yig'ish alohida ish sifatida |
| Do'kon narxni yangilamaydi | Katalog 2 haftada yolg'onga aylanadi | Bot orqali 1 bosishda yangilash + "oxirgi yangilangan" sanasi ko'rsatiladi |
| AI xarajati oshib ketadi | Pul yonadi | Kunlik limit, foydalanuvchi limiti, navbat |
| Modullar bir-biriga tayanib qoladi | Hamma kutadi | 5-bo'lim: shartnoma birinchi, ID orqali bog'lanish |
| 6 dasturchi, 0 sotuvchi | Mahsulot bor, mijoz yo'q | 10-bo'lim |
