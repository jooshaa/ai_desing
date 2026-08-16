# Local setup (recommended)

Run Imora on **your computer** with Cursor Desktop or any editor. You do not need the Cloud Agent sandbox.

## What you need

| Tool | Version |
|---|---|
| Node.js | 22+ ([nvm](https://github.com/nvm-sh/nvm) recommended) |
| pnpm | 10+ (`npm i -g pnpm`) |
| Docker Desktop | for Postgres, Redis, MinIO |
| Git | any recent version |

Optional: Telegram bot token, SMS/AI keys (stubs work for skeleton).

---

## 1. Get the code on your machine

### If GitHub already has the repo

```bash
git clone https://github.com/jooshaa/ai_desing.git
cd ai_desing
```

### If the repo is still empty — use the agent zip

1. Open your Cursor Cloud Agent run in the browser.
2. Download **`imora_local_project.zip`** from the run artifacts.
3. Unzip and open that folder in Cursor Desktop:

```bash
unzip imora_local_project.zip -d ai_desing
cd ai_desing
git init
git branch -M main
git remote add origin https://github.com/jooshaa/ai_desing.git
```

After the first push from your machine:

```bash
git add .
git commit -m "feat: Imora MVP monorepo skeleton"
git push -u origin main
```

---

## 2. Install dependencies

```bash
pnpm install
cp .env.example .env
```

Edit `.env` if needed (defaults work with Docker below).

---

## 3. Start infrastructure

```bash
docker compose up -d
```

This starts:

- **Postgres** — `localhost:5432` (user/pass/db: `imora`)
- **Redis** — `localhost:6379`
- **MinIO** — `localhost:9000` (console `9001`, user `imora` / pass `imora-secret`)

Check:

```bash
docker compose ps
```

---

## 4. Run apps (separate terminals)

**Terminal 1 — API**

```bash
pnpm --filter @imora/shared-types build
pnpm --filter @imora/backend dev
```

API: http://localhost:3001/api/health

**Terminal 2 — customer app**

```bash
pnpm --filter @imora/web-user dev
```

App: http://localhost:3000

**Terminal 3 — store panel**

```bash
pnpm --filter @imora/web-store dev
```

App: http://localhost:3002

**Terminal 4 — Telegram bot (optional)**

```bash
# set TELEGRAM_BOT_TOKEN in .env first
pnpm --filter @imora/bot-store dev
```

---

## 5. Mock API while backend is incomplete

Frontend does not need a live backend if contracts exist:

```bash
pnpm mock:catalog   # port 4011
pnpm mock:auth      # port 4010
pnpm mock:orders    # port 4012
pnpm mock:design    # port 4013
```

Point `NEXT_PUBLIC_API_URL` in `.env` at the mock port you use.

---

## 6. Verify everything

```bash
pnpm format:check
pnpm typecheck
pnpm build
```

---

## Open in Cursor Desktop (local, not Cloud Agent)

1. **File → Open Folder** → select the `ai_desing` folder.
2. Use the built-in terminal (`Ctrl+`` `) — commands run on **your** machine.
3. Git push uses **your** GitHub login — no `cursor[bot]` permission issues.
4. Disable or ignore Cloud Agents for this repo if you only want local work.

---

## Team workflow (6 developers)

| Developer | Folder |
|---|---|
| Jo'shqin | `backend/src/core/`, `backend/src/common/` |
| Abdumalik | `backend/src/catalog/` |
| Shohjahon | `backend/src/orders/` |
| Abdunazar | `backend/src/design/` |
| Sarvarbek | `web-user/` |
| Otabek | `web-store/`, `bot-store/` |

Rules: contract-first (`contracts/*.yaml`), no TypeORM `synchronize`, cross-module IDs only. See `CONTRIBUTING.md` and `docs/IMORA_TZ.md`.

---

## Common issues

**Port 3000 already in use** — another app is running; stop it or change the port in `web-user/package.json` dev script.

**Backend: ECONNREFUSED Postgres** — run `docker compose up -d` and wait until Postgres is healthy.

**pnpm not found** — `npm install -g pnpm` or enable Corepack: `corepack enable`.

**Windows** — use Docker Desktop with WSL2; run commands in Git Bash or WSL terminal inside the project folder.
