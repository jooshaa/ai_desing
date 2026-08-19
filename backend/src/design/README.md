# design — Abdunazar

Room photo → validate → quota check → queue → external AI API → 3 variants +
material tags.

Emits `DesignMaterial.tag` only. Matching those tags to catalog products is
module 3's work (IMORA_TZ §6).

## Endpoints

Implements `contracts/design.openapi.yaml`.

| Method | Path                             | Auth | Notes                                  |
| ------ | -------------------------------- | ---- | -------------------------------------- |
| GET    | `/design/styles`                 | –    | Style library, incl. `nameUz`          |
| GET    | `/design/quota`                  | ✔    | Remaining free generations (AC-11)     |
| POST   | `/design/requests`               | ✔    | multipart `image` + `style`; 202 / 402 |
| GET    | `/design/requests`               | ✔    | Caller's recent requests               |
| GET    | `/design/requests/:id`           | ✔    | Status + variants (poll this)          |
| GET    | `/design/variants/:id/materials` | –    | Tags for module 3                      |

## How a request flows

1. `DesignController` validates the DTO and hands the file to `DesignService`.
2. `DesignService` checks image type/size, asks `QuotaService`, stores the photo,
   inserts a `queued` row, and enqueues — in that order, so a blocked request
   leaves no orphan file and a job never references an uncommitted row.
3. `DesignJobQueue` (inline or Bull) hands the id to `DesignGenerationService`.
4. That builds one prompt per variant, calls the provider **in parallel**, saves
   whatever came back, derives material tags, and books the real cost.

## Configuration

Everything has a working default — a fresh clone runs with none of these set.
`.env.example` is Tech Lead territory (§5.4), so the design-only keys are listed
here for Jo'shqin to fold in.

| Variable                   | Default      | Purpose                                          |
| -------------------------- | ------------ | ------------------------------------------------ |
| `AI_PROVIDER`              | `stub`       | `stub` \| `gemini` \| `fal` \| `cloudflare`      |
| `AI_MODEL`                 | per provider | Overrides the model (and its price) for `gemini` |
| `AI_API_KEY`               | –            | Provider key                                     |
| `AI_CLOUDFLARE_ACCOUNT_ID` | –            | Cloudflare only                                  |
| `AI_VARIANT_COUNT`         | `3`          | Variants per request (AC-08)                     |
| `AI_USER_DAILY_LIMIT`      | `5`          | Requests per user per day; `-1` unlimited        |
| `AI_DAILY_LIMIT`           | `100`        | Requests across all users per day                |
| `AI_DAILY_BUDGET_USD`      | `1`          | **Hard money cap per day**; `-1` disables        |
| `AI_TZ_OFFSET_HOURS`       | `5`          | Limits reset at local midnight, not UTC          |
| `AI_CONCURRENCY`           | `2`          | Bull worker concurrency                          |
| `DESIGN_QUEUE_DRIVER`      | `inline`     | `inline` (no Redis) \| `bull`                    |
| `DESIGN_DEV_USER_ID`       | –            | Dev-only stand-in identity, see below            |

### Cost control

Counts alone are a bad guard — they stop tracking spend the moment the model or
variant count changes. So the budget is checked against the **estimated cost of
this specific request** (`price/image × variants`) before it is accepted, and the
estimate is booked immediately so concurrent uploads cannot each see a full
budget. On completion it is corrected to what was actually generated; failed
requests are charged nothing and do not consume the user's daily allowance.

At the default `AI_DAILY_BUDGET_USD=1`, Gemini at $0.039/image and 3 variants,
the API stops accepting new requests after **8 requests/day**. Raise it
deliberately — see `docs/design-ai-providers.md` for the full price table.

### Auth, temporarily

Core's `JwtAuthGuard` still throws unconditionally, so `DesignAuthGuard` reads
`request.user` and, **only** when `NODE_ENV=development` _and_
`DESIGN_DEV_USER_ID` is set, falls back to that id. `design-auth.guard.spec.ts`
pins that the bypass is unreachable in production. When core ships real JWT
verification, swap the guard and delete the seam.

## Queue drivers

`inline` runs generation in-process right after the 202 response — the default,
because Redis needs Docker and not everyone on the team has it. `bull` is the
production path from §2. The BullMQ Queue and Worker are constructed by hand in
`BullDesignQueue` rather than via `BullModule.registerQueue`, because a module
decorator is evaluated before ConfigModule reads `.env` and therefore cannot be
made conditional; doing it this way keeps `app.module.ts` untouched.

## Tests

```bash
pnpm --filter @imora/backend exec jest src/design
```

Covers prompt building and note sanitisation, quota and budget arithmetic,
local-midnight resets, cost estimation, provider selection, material tag
extraction, and the dev-auth seam.
