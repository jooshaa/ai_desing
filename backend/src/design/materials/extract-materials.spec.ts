import { extractMaterials, labelForTag } from './extract-materials';
import { DESIGN_STYLES } from '../prompts/styles';

describe('labelForTag', () => {
  it('renders the Uzbek label shape the contract documents', () => {
    expect(labelForTag('wall.wallpaper.warm-beige')).toBe('devor: oboy, iliq bej');
  });

  it('translates every surface it supports', () => {
    expect(labelForTag('floor.laminate.light-oak')).toBe('pol: laminat, och eman');
    expect(labelForTag('ceiling.paint.white')).toBe("shift: bo'yoq, oq");
  });

  it('falls back to readable English for tokens it does not know', () => {
    expect(labelForTag('wall.marble.sea-green')).toBe('devor: marble, sea green');
  });

  it('handles a two-part tag with no shade', () => {
    expect(labelForTag('wall.brick')).toBe("devor: g'isht");
  });
});

describe('extractMaterials', () => {
  it('returns the style baseline when there is nothing else to go on', () => {
    const materials = extractMaterials({ styleId: 'classic' });

    expect(materials.map((m) => m.tag)).toEqual([
      'wall.wallpaper.warm-beige',
      'floor.parquet.walnut',
      'ceiling.moulding.white',
    ]);
  });

  it('gives every shipped style a non-empty material list', () => {
    for (const style of DESIGN_STYLES) {
      expect(extractMaterials({ styleId: style.id }).length).toBeGreaterThan(0);
    }
  });

  it('returns nothing for an unknown style rather than inventing tags', () => {
    expect(extractMaterials({ styleId: 'does-not-exist' })).toEqual([]);
  });

  it('adds wet-area finishes for bathrooms, in Uzbek or English', () => {
    const tags = extractMaterials({ styleId: 'modern', roomType: 'Bathroom' }).map((m) => m.tag);
    const uzTags = extractMaterials({ styleId: 'modern', roomType: 'hammom' }).map((m) => m.tag);

    expect(tags).toContain('wall.tile.glossy-white');
    expect(uzTags).toContain('floor.tile.matte-grey');
  });

  it('labels the wet-area shades in Uzbek, not English', () => {
    const bathroom = extractMaterials({ styleId: 'modern', roomType: 'bathroom' });
    const labels = new Map(bathroom.map((m) => [m.tag, m.label]));

    expect(labels.get('wall.tile.glossy-white')).toBe('devor: kafel, yaltiroq oq');
    expect(labels.get('floor.tile.matte-grey')).toBe('pol: kafel, matoviy kulrang');
  });

  it('picks up a material a provider actually described', () => {
    const tags = extractMaterials({
      styleId: 'minimal',
      hints: ['The floor is finished in warm beige parquet.'],
    }).map((m) => m.tag);

    expect(tags).toContain('floor.parquet.warm-beige');
  });

  it('ignores hints that name no material, instead of emitting a junk tag', () => {
    const baseline = extractMaterials({ styleId: 'minimal' });
    const withHint = extractMaterials({ styleId: 'minimal', hints: ['warm ambient lighting'] });

    expect(withHint).toEqual(baseline);
  });

  it('de-duplicates and caps the list so the UI stays readable', () => {
    const materials = extractMaterials({
      styleId: 'modern',
      roomType: 'bathroom',
      hints: ['wall paint warm white', 'ceiling wood carved', 'floor carpet suzani'],
    });

    expect(materials.length).toBeLessThanOrEqual(6);
    expect(new Set(materials.map((m) => m.tag)).size).toBe(materials.length);
  });

  it('labels every tag it returns', () => {
    for (const material of extractMaterials({ styleId: 'national' })) {
      expect(material.label).toContain(':');
    }
  });
});
