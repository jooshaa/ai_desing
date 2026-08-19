import { estimateRequestCostUsd, PRICE_PER_IMAGE_USD } from './estimate-cost';

describe('estimateRequestCostUsd', () => {
  it('multiplies list price by the number of variants', () => {
    expect(estimateRequestCostUsd(0.039, 3)).toBe(0.117);
  });

  it('costs nothing for the stub provider', () => {
    expect(estimateRequestCostUsd(PRICE_PER_IMAGE_USD.stub, 3)).toBe(0);
  });

  it('keeps sub-cent providers from rounding away to zero', () => {
    expect(estimateRequestCostUsd(PRICE_PER_IMAGE_USD['cloudflare-flux-1-schnell'], 3)).toBe(
      0.0018,
    );
  });

  it('returns zero when no variants are requested', () => {
    expect(estimateRequestCostUsd(0.039, 0)).toBe(0);
  });

  it('rejects negative input rather than silently crediting the budget', () => {
    expect(() => estimateRequestCostUsd(-1, 3)).toThrow(RangeError);
    expect(() => estimateRequestCostUsd(0.039, -3)).toThrow(RangeError);
  });
});
