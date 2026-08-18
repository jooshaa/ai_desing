import { resolveCurrentPrice } from './resolve-current-price';

describe('resolveCurrentPrice', () => {
  const now = new Date('2026-08-17T12:00:00Z');

  it('picks the row with the latest validFrom that is not in the future', () => {
    const rows = [
      { validFrom: new Date('2026-08-01T00:00:00Z'), price: '100' },
      { validFrom: new Date('2026-08-15T00:00:00Z'), price: '120' },
      { validFrom: new Date('2026-08-20T00:00:00Z'), price: '999' }, // future — must be ignored
    ];

    const current = resolveCurrentPrice(rows, now);

    expect(current?.price).toBe('120');
  });

  it('returns null when there is no price history yet', () => {
    expect(resolveCurrentPrice([], now)).toBeNull();
  });

  it('returns null when every price is scheduled in the future', () => {
    const rows = [{ validFrom: new Date('2026-09-01T00:00:00Z'), price: '100' }];

    expect(resolveCurrentPrice(rows, now)).toBeNull();
  });

  it('a validFrom exactly at "now" counts as current, not future', () => {
    const rows = [{ validFrom: now, price: '55' }];

    expect(resolveCurrentPrice(rows, now)?.price).toBe('55');
  });
});
