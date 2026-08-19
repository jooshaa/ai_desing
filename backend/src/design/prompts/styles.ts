import type { DesignStyleDto } from '@imora/shared-types';

/**
 * Style library used to build generation prompts (IMORA_TZ §4, module 4).
 *
 * `nameUz` extends the contract's `DesignStyle` for the Uzbek UI. It is added
 * here rather than in `packages/shared-types` because that package is Tech Lead
 * territory (IMORA_TZ §5.4) — `contracts/design.openapi.yaml` (owned by this
 * module) documents the field, and shared-types can absorb it when approved.
 *
 * `materialTags` is the baseline material vocabulary a style implies. It feeds
 * `extractMaterials()` and must use the same tag namespace as catalog's
 * `ProductTag.tag`, because module 3 joins the two (IMORA_TZ §6).
 */
export interface DesignStyle extends DesignStyleDto {
  nameUz: string;
  materialTags: string[];
}

export const DESIGN_STYLES: readonly DesignStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    nameUz: 'Zamonaviy',
    promptHint: 'clean lines, light oak, matte surfaces, warm neutral palette, indirect lighting',
    materialTags: [
      'wall.paint.warm-white',
      'floor.laminate.light-oak',
      'ceiling.stretch.matte-white',
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameUz: 'Minimalizm',
    promptHint: 'white walls, hidden storage, very few objects, soft diffuse daylight',
    materialTags: [
      'wall.paint.pure-white',
      'floor.laminate.pale-grey',
      'ceiling.stretch.matte-white',
    ],
  },
  {
    id: 'classic',
    name: 'Classic',
    nameUz: 'Klassik',
    promptHint: 'warm millwork, soft gold accents, symmetry, moulding, layered warm lighting',
    materialTags: ['wall.wallpaper.warm-beige', 'floor.parquet.walnut', 'ceiling.moulding.white'],
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    nameUz: 'Skandinav',
    promptHint: 'pale birch wood, off-white walls, textile layers, bright even daylight',
    materialTags: ['wall.paint.off-white', 'floor.laminate.birch', 'ceiling.paint.white'],
  },
  {
    id: 'national',
    name: 'National',
    nameUz: 'Milliy',
    promptHint:
      'Uzbek national motifs, hand-carved ganch details, suzani textile accents, warm terracotta and turquoise palette',
    materialTags: ['wall.wallpaper.terracotta-motif', 'floor.carpet.suzani', 'ceiling.wood.carved'],
  },
  {
    id: 'loft',
    name: 'Loft',
    nameUz: 'Loft',
    promptHint: 'exposed brick, dark metal, concrete finish, industrial pendant lights',
    materialTags: ['wall.brick.red-exposed', 'floor.concrete.grey', 'ceiling.paint.charcoal'],
  },
] as const;

export const DEFAULT_STYLE_ID = 'modern';

export function findStyle(styleId: string): DesignStyle | undefined {
  return DESIGN_STYLES.find((style) => style.id === styleId);
}

export function isKnownStyle(styleId: string): boolean {
  return findStyle(styleId) !== undefined;
}
