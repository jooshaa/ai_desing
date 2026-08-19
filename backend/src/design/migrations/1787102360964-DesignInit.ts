import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the three design-owned tables (IMORA_TZ §6).
 *
 * No foreign key to `users`: IMORA_TZ §5.2 permits a relation to core's
 * `User`, but core has not shipped its migration yet, and an FK to a table
 * that does not exist would make this migration unrunnable on a clean database
 * — which AC-15 requires it to be. The join stays an id, as it does for every
 * other cross-module reference.
 */
export class DesignInit1787102360964 implements MigrationInterface {
  name = 'DesignInit1787102360964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "design_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "inputImageUrl" varchar NOT NULL,
        "roomType" varchar,
        "style" varchar NOT NULL,
        "note" text,
        "status" varchar NOT NULL DEFAULT 'queued',
        "apiCost" numeric(12,4) NOT NULL DEFAULT 0,
        "provider" varchar NOT NULL DEFAULT 'stub',
        "model" varchar NOT NULL DEFAULT 'stub',
        "errorMessage" text,
        "completedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    // Both indexes exist for the quota queries, which run on every upload:
    // per-user count and per-day global count plus spend (AC-11).
    await queryRunner.query(
      `CREATE INDEX "IDX_design_requests_userId_createdAt" ON "design_requests" ("userId", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_design_requests_createdAt" ON "design_requests" ("createdAt")`,
    );

    await queryRunner.query(`
      CREATE TABLE "design_variants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "requestId" uuid NOT NULL,
        "imageUrl" varchar NOT NULL,
        "sort" integer NOT NULL DEFAULT 0
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_design_variants_requestId_sort" ON "design_variants" ("requestId", "sort")`,
    );

    await queryRunner.query(`
      CREATE TABLE "design_materials" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "variantId" uuid NOT NULL,
        "tag" varchar NOT NULL,
        "label" varchar NOT NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_design_materials_variantId" ON "design_materials" ("variantId")`,
    );
    // Module 3 joins design_materials.tag to product_tags.tag (IMORA_TZ §6).
    await queryRunner.query(
      `CREATE INDEX "IDX_design_materials_tag" ON "design_materials" ("tag")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "design_materials"`);
    await queryRunner.query(`DROP TABLE "design_variants"`);
    await queryRunner.query(`DROP TABLE "design_requests"`);
  }
}
