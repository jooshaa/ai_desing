# Imora

Room photo → AI design variants → catalog materials → price compare → store order.

MVP monorepo from `docs/IMORA_TZ.md`.

> **Run locally on your PC** — see **[LOCAL_SETUP.md](./LOCAL_SETUP.md)**.  
> Do not rely on the Cursor Cloud sandbox for git push or day-to-day dev.

## Packages

| Path                     | Owner                            | Role                                        |
| ------------------------ | -------------------------------- | ------------------------------------------- |
| `contracts/`             | module owners, Tech Lead reviews | OpenAPI contracts — write these before code |
| `packages/shared-types/` | Tech Lead                        | Types generated from contracts              |
| `backend/src/core/`      | Jo'shqin                         | Users, OTP+JWT auth, roles, addresses       |
| `backend/src/catalog/`   | Abdumalik Najot                  | Stores, categories, products, prices        |
| `backend/src/orders/`    | Shohjahon NT                     | Cart, orders, price compare                 |
| `backend/src/design/`    | Abdunazar                        | Image upload, AI queue, variants, tags      |
| `backend/src/common/`    | Tech Lead only                   | Filters, logger, request id                 |
| `web-user/`              | Sarvarbek Sodiqov                | Customer app                                |
| `web-store/`             | Otabek                           | Store dashboard                             |
| `bot-store/`             | Otabek                           | Telegram bot for stores                     |

## Quick start (local)

```bash
pnpm install
docker compose up -d
cp .env.example .env
pnpm --filter @imora/shared-types build
pnpm --filter @imora/backend dev
```

Full steps: **[LOCAL_SETUP.md](./LOCAL_SETUP.md)**

Frontend can start against Prism mocks before the API exists:

```bash
pnpm mock:catalog
```

## Rules

- TypeORM `synchronize` is **never** enabled. Use migrations.
- Cross-module relations use **IDs**, not entity imports (except Core `User`, read-only).
- Shared files (`app.module.ts`, `common/**`, root configs) change only with Tech Lead approval.
- Branch names: `feat/catalog-…`, `feat/orders-…`, `feat/design-…`.
