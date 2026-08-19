/**
 * List prices in USD per generated 1K image, checked against each vendor's own
 * pricing page on 2026-08-18. Kept in one table so `docs/design-ai-providers.md`
 * and the runtime budget guard can never drift apart.
 *
 * Re-check before any launch decision — image model prices moved several times
 * in 2026, and Google retired Imagen 4 on 2026-08-17.
 */
export const PRICE_PER_IMAGE_USD = {
  stub: 0,
  'gemini-2.5-flash-image': 0.039,
  'gemini-3.1-flash-lite-image': 0.0336,
  'gemini-3.1-flash-image': 0.067,
  'gemini-3-pro-image': 0.134,
  'fal-flux-kontext-pro': 0.04,
  'cloudflare-flux-1-schnell': 0.0006,
} as const;

export type PricedModel = keyof typeof PRICE_PER_IMAGE_USD;

/**
 * What one design request costs at list price. Money is the top risk on this
 * module (IMORA_TZ §12 — "AI xarajati oshib ketadi"), so the number is computed
 * before the request is accepted, not discovered on the invoice.
 */
export function estimateRequestCostUsd(pricePerImageUsd: number, variantCount: number): number {
  if (pricePerImageUsd < 0 || variantCount < 0) {
    throw new RangeError('Price and variant count must not be negative');
  }
  // 4 dp: a single variant can cost less than a tenth of a cent on Cloudflare.
  return Number((pricePerImageUsd * variantCount).toFixed(4));
}
