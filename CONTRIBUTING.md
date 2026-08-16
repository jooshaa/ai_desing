# Contributing

## Contract first

1. Change `contracts/*.yaml`.
2. Announce the change.
3. Then update code and `packages/shared-types`.

Frontend does not wait on backend. Mock with Prism:

```bash
npx @stoplight/prism-cli mock contracts/catalog.openapi.yaml -p 4010
```

## Entity boundary

```ts
// correct — other modules store an ID
@Column('uuid') productId: string;

// wrong — do not import another module's entity
@ManyToOne(() => Product) product: Product;
```

Exception: Core `User` may be referenced with `ManyToOne` for reads only.

## Shared files (ask Tech Lead)

- `backend/src/app.module.ts`
- `backend/src/common/**`
- root `package.json`, `docker-compose.yml`, CI
- `packages/shared-types/**`

## Branches

`feat/<module>-<short-name>` — rebase onto `main` daily. Keep PRs under 400 lines when possible.
