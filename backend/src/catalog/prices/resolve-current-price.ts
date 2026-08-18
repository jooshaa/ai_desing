export interface PriceRow {
  validFrom: Date;
  [key: string]: unknown;
}

/**
 * Pure function: pick the "current" price out of a product's price history.
 * Current = latest `validFrom` that is not in the future. Kept separate from
 * ProductsService so the selection rule can be unit tested without a DB.
 */
export function resolveCurrentPrice<T extends PriceRow>(
  rows: T[],
  now: Date = new Date(),
): T | null {
  let current: T | null = null;
  for (const row of rows) {
    if (row.validFrom.getTime() > now.getTime()) {
      continue;
    }
    if (!current || row.validFrom.getTime() > current.validFrom.getTime()) {
      current = row;
    }
  }
  return current;
}
