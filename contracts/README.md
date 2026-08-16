# API contracts

Each backend module owns its OpenAPI file. Tech Lead reviews before frontend relies on it.

| File                   | Module  | Mock port |
| ---------------------- | ------- | --------- |
| `auth.openapi.yaml`    | core    | 4010      |
| `catalog.openapi.yaml` | catalog | 4011      |
| `orders.openapi.yaml`  | orders  | 4012      |
| `design.openapi.yaml`  | design  | 4013      |

```bash
npx @stoplight/prism-cli mock contracts/catalog.openapi.yaml -p 4011
```
