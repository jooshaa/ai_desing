import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the five catalog-owned tables (IMORA_TZ §6). Hand-written, not
 * `migration:generate`-d: no Postgres was reachable in this environment
 * (Docker unavailable). Column/index shapes mirror the entity files exactly
 * — verify with `pnpm --filter @imora/backend migration:run` against a real
 * DB before merging, per AC-15.
 */
export class CatalogInit1786946699117 implements MigrationInterface {
  name = 'CatalogInit1786946699117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "stores" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "ownerUserId" uuid NOT NULL,
        "phone" varchar NOT NULL,
        "region" varchar NOT NULL,
        "districts" text[] NOT NULL DEFAULT '{}',
        "status" varchar NOT NULL DEFAULT 'pending',
        "logoUrl" varchar
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_stores_ownerUserId" ON "stores" ("ownerUserId")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_stores_status" ON "stores" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "parentId" uuid,
        "nameUz" varchar NOT NULL,
        "nameRu" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "sort" integer NOT NULL DEFAULT 0,
        "icon" varchar
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_categories_slug" ON "categories" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_parentId" ON "categories" ("parentId")`);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "storeId" uuid NOT NULL,
        "categoryId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "unit" varchar NOT NULL,
        "imageUrls" text[] NOT NULL DEFAULT '{}',
        "attributes" jsonb NOT NULL DEFAULT '{}',
        "isActive" boolean NOT NULL DEFAULT true
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_products_storeId" ON "products" ("storeId")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_categoryId" ON "products" ("categoryId")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_isActive" ON "products" ("isActive")`);

    await queryRunner.query(`
      CREATE TABLE "product_prices" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "productId" uuid NOT NULL,
        "price" numeric(12,2) NOT NULL,
        "currency" varchar NOT NULL DEFAULT 'UZS',
        "validFrom" timestamptz NOT NULL,
        "inStock" boolean NOT NULL DEFAULT true
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_prices_productId_validFrom" ON "product_prices" ("productId", "validFrom" DESC)`,
    );

    await queryRunner.query(`
      CREATE TABLE "product_tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "productId" uuid NOT NULL,
        "tag" varchar NOT NULL
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_product_tags_productId_tag" ON "product_tags" ("productId", "tag")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_product_tags_tag" ON "product_tags" ("tag")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_tags"`);
    await queryRunner.query(`DROP TABLE "product_prices"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "stores"`);
  }
}
