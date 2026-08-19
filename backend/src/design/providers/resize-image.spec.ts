import { fitDimensions, KLEIN_MAX_INPUT_EDGE } from './resize-image';

describe('fitDimensions', () => {
  it('leaves a photo that already fits alone', () => {
    expect(fitDimensions(400, 300)).toEqual({ width: 400, height: 300, needsResize: false });
  });

  it('treats an image exactly at the cap as fitting', () => {
    expect(fitDimensions(511, 511).needsResize).toBe(false);
  });

  it('shrinks an image one pixel over the cap', () => {
    expect(fitDimensions(512, 512)).toEqual({ width: 511, height: 511, needsResize: true });
  });

  it('scales a landscape photo by its long edge and keeps the ratio', () => {
    const fitted = fitDimensions(1600, 1200);

    expect(fitted.width).toBe(KLEIN_MAX_INPUT_EDGE);
    expect(fitted.height).toBe(383); // 1200 * (511/1600)
    expect(fitted.width / fitted.height).toBeCloseTo(1600 / 1200, 1);
  });

  it('scales a portrait photo by its long edge', () => {
    const fitted = fitDimensions(1200, 1600);

    expect(fitted.height).toBe(KLEIN_MAX_INPUT_EDGE);
    expect(fitted.width).toBe(383);
  });

  it('keeps both edges strictly under 512, which is what Cloudflare requires', () => {
    for (const [w, h] of [
      [4032, 3024],
      [3024, 4032],
      [8000, 600],
      [513, 512],
    ]) {
      const fitted = fitDimensions(w, h);
      expect(fitted.width).toBeLessThan(512);
      expect(fitted.height).toBeLessThan(512);
    }
  });

  it('never collapses an extreme panorama to a zero-height image', () => {
    const fitted = fitDimensions(10000, 20);

    expect(fitted.height).toBeGreaterThanOrEqual(1);
    expect(fitted.width).toBe(KLEIN_MAX_INPUT_EDGE);
  });

  it('honours a custom cap for providers with different limits', () => {
    expect(fitDimensions(2000, 1000, 100)).toEqual({
      width: 100,
      height: 50,
      needsResize: true,
    });
  });

  it('rejects nonsense dimensions rather than producing a broken image', () => {
    expect(() => fitDimensions(0, 100)).toThrow(RangeError);
    expect(() => fitDimensions(100, -5)).toThrow(RangeError);
  });
});
