import { parseImportRow } from './parse-import-row';

describe('parseImportRow', () => {
  it('parses a fully populated row', () => {
    const row = parseImportRow({
      categorySlug: 'ichki-eshiklar',
      name: "Yog'och eshik",
      description: "Massiv yog'och",
      unit: 'dona',
      price: '1500000',
      currency: 'uzs',
      inStock: 'true',
      attributes: '{"rang":"jigarrang"}',
    });

    expect(row).toEqual({
      categorySlug: 'ichki-eshiklar',
      name: "Yog'och eshik",
      description: "Massiv yog'och",
      unit: 'dona',
      price: 1500000,
      currency: 'UZS',
      inStock: true,
      attributes: { rang: 'jigarrang' },
    });
  });

  it('is case-insensitive on column headers and defaults optional fields', () => {
    const row = parseImportRow({ CategorySlug: 'devor', Name: 'Oboy', Unit: 'm2', Price: 45000 });

    expect(row.categorySlug).toBe('devor');
    expect(row.description).toBeNull();
    expect(row.currency).toBe('UZS');
    expect(row.inStock).toBe(true);
    expect(row.attributes).toEqual({});
  });

  it('accepts a comma decimal separator', () => {
    const row = parseImportRow({
      categorySlug: 'devor',
      name: 'Oboy',
      unit: 'm2',
      price: '45000,50',
    });
    expect(row.price).toBeCloseTo(45000.5);
  });

  it('rejects a missing name', () => {
    expect(() => parseImportRow({ categorySlug: 'devor', unit: 'm2', price: 100 })).toThrow(/name/);
  });

  it('rejects a non-numeric price', () => {
    expect(() =>
      parseImportRow({ categorySlug: 'devor', name: 'Oboy', unit: 'm2', price: 'bepul' }),
    ).toThrow(/price/);
  });

  it('rejects a zero or negative price', () => {
    expect(() =>
      parseImportRow({ categorySlug: 'devor', name: 'Oboy', unit: 'm2', price: 0 }),
    ).toThrow(/price/);
  });

  it('rejects malformed attributes JSON', () => {
    expect(() =>
      parseImportRow({
        categorySlug: 'devor',
        name: 'Oboy',
        unit: 'm2',
        price: 100,
        attributes: '{bad',
      }),
    ).toThrow(/attributes/);
  });

  it('recognizes falsy inStock strings', () => {
    const row = parseImportRow({
      categorySlug: 'devor',
      name: 'Oboy',
      unit: 'm2',
      price: 100,
      inStock: "yo'q",
    });
    expect(row.inStock).toBe(false);
  });
});
