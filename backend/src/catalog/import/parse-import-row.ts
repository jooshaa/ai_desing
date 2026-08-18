export interface ImportRowInput {
  [key: string]: unknown;
}

export interface ParsedImportRow {
  categorySlug: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  currency: string;
  inStock: boolean;
  attributes: Record<string, unknown>;
}

const FALSY_STRINGS = new Set(['false', '0', 'no', "yo'q", 'yoq']);

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return !FALSY_STRINGS.has(String(value).trim().toLowerCase());
}

function readColumn(raw: ImportRowInput, ...keys: string[]): unknown {
  const normalized = new Map(Object.keys(raw).map((k) => [k.trim().toLowerCase(), raw[k]]));
  for (const key of keys) {
    const value = normalized.get(key);
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return undefined;
}

/**
 * Pure function: one Excel/CSV row -> a validated product+price shape, or throws
 * a human-readable error. Kept out of ImportService so row-level rules can be
 * unit tested without a spreadsheet or a DB (AC-03).
 */
export function parseImportRow(raw: ImportRowInput): ParsedImportRow {
  const categorySlug = String(readColumn(raw, 'categoryslug', 'category') ?? '').trim();
  if (!categorySlug) {
    throw new Error("categorySlug ustuni bo'sh");
  }

  const name = String(readColumn(raw, 'name') ?? '').trim();
  if (!name) {
    throw new Error("name ustuni bo'sh");
  }

  const unit = String(readColumn(raw, 'unit') ?? '').trim();
  if (!unit) {
    throw new Error("unit ustuni bo'sh");
  }

  const priceRaw = readColumn(raw, 'price');
  const price =
    typeof priceRaw === 'number'
      ? priceRaw
      : Number(
          String(priceRaw ?? '')
            .replace(/\s/g, '')
            .replace(',', '.'),
        );
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`price noto'g'ri: "${String(priceRaw)}"`);
  }

  const descriptionRaw = readColumn(raw, 'description');
  const description = descriptionRaw ? String(descriptionRaw).trim() : null;

  const currencyRaw = readColumn(raw, 'currency');
  const currency = currencyRaw ? String(currencyRaw).trim().toUpperCase() : 'UZS';

  const inStockRaw = readColumn(raw, 'instock', 'in_stock');
  const inStock = inStockRaw === undefined ? true : parseBoolean(inStockRaw);

  const attributesRaw = readColumn(raw, 'attributes');
  let attributes: Record<string, unknown> = {};
  if (attributesRaw) {
    try {
      attributes = JSON.parse(String(attributesRaw)) as Record<string, unknown>;
    } catch {
      throw new Error('attributes ustuni JSON formatida emas');
    }
  }

  return { categorySlug, name, description, unit, price, currency, inStock, attributes };
}
