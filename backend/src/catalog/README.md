# catalog — Abdumalik Najot

Stores, categories, products, prices, tags, Excel import.

Other modules must reference products by `productId`, not by importing these entities.
Cross-module reads go through `CatalogService` (`catalog.service.ts`) — the only export of this module.

## Status (0+1-bosqich)

Implemented: category tree + admin CRUD, store self-registration/profile, product CRUD scoped by
ownership, price history (append-only, AC-07), tags (for design/search material matching), image
upload (local-disk mock — see `storage/`), Excel/CSV import (AC-03, partial success).

Blocked on core: every `/store/*` and `/admin/*` route uses `JwtAuthGuard`
(`core/auth/guards/jwt-auth.guard.ts`), which currently always throws — it isn't implemented yet.
Once it populates `request.user = { id, role, phone }`, these routes work as specified; nothing in
catalog needs to change. Public `GET /categories` and `GET /products*` need no auth and work today.

Migration `migrations/1786946699117-CatalogInit.ts` was hand-written (no Docker/Postgres available
here to run `migration:generate`) — run it against a real DB and confirm AC-15 before merging.
