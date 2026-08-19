import { findStyle } from '../prompts/styles';

export interface ExtractedMaterial {
  /** Joins to catalog's `ProductTag.tag` (IMORA_TZ §6). */
  tag: string;
  /** Uzbek label shown under the variant, e.g. "devor: oboy, iliq bej". */
  label: string;
}

const SURFACE_UZ: Record<string, string> = {
  wall: 'devor',
  floor: 'pol',
  ceiling: 'shift',
};

const MATERIAL_UZ: Record<string, string> = {
  paint: "bo'yoq",
  wallpaper: 'oboy',
  laminate: 'laminat',
  parquet: 'parket',
  carpet: 'gilam',
  tile: 'kafel',
  concrete: 'beton',
  brick: "g'isht",
  stretch: 'tarang shift',
  wood: "yog'och",
  moulding: 'karniz',
};

const SHADE_UZ: Record<string, string> = {
  'warm-white': 'iliq oq',
  'pure-white': 'sof oq',
  'off-white': 'oqish',
  'matte-white': 'matoviy oq',
  white: 'oq',
  'pale-grey': 'och kulrang',
  grey: 'kulrang',
  charcoal: "to'q kulrang",
  'light-oak': 'och eman',
  birch: 'qayin',
  walnut: "yong'oq",
  'warm-beige': 'iliq bej',
  'terracotta-motif': 'terrakota naqsh',
  suzani: "so'zana",
  'red-exposed': 'ochiq qizil',
  'glossy-white': 'yaltiroq oq',
  'matte-grey': 'matoviy kulrang',
  'backsplash-white': 'oq fartuk',
  carved: "o'ymakor",
};

/** Rooms that need a wet-area finish no style baseline would suggest. */
const ROOM_EXTRA_TAGS: Record<string, string[]> = {
  bathroom: ['wall.tile.glossy-white', 'floor.tile.matte-grey'],
  hammom: ['wall.tile.glossy-white', 'floor.tile.matte-grey'],
  kitchen: ['wall.tile.backsplash-white'],
  oshxona: ['wall.tile.backsplash-white'],
};

const MAX_MATERIALS = 6;

function humanise(token: string): string {
  return token.replace(/-/g, ' ');
}

/**
 * Turns a `surface.material.shade` tag into the Uzbek label the UI shows.
 * Unknown tokens fall through as de-hyphenated English rather than being
 * dropped: a slightly English label is still useful, a missing material is not.
 */
export function labelForTag(tag: string): string {
  const [surface, material, ...shadeParts] = tag.split('.');
  const shade = shadeParts.join('.');

  const surfaceLabel = SURFACE_UZ[surface] ?? humanise(surface ?? '');
  const materialLabel = MATERIAL_UZ[material] ?? humanise(material ?? '');
  const shadeLabel = shade ? (SHADE_UZ[shade] ?? humanise(shade)) : '';

  const right = [materialLabel, shadeLabel].filter(Boolean).join(', ');
  return right ? `${surfaceLabel}: ${right}` : surfaceLabel;
}

/**
 * Produces the material tags shown under a variant.
 *
 * Deliberately deterministic rather than a second AI call. Asking a language
 * model to describe each render would roughly double the per-request bill for
 * information the style already implies, and IMORA_TZ §4 only asks this module
 * to *emit tags* — matching them to catalog products is module 3's job.
 *
 * Provider text hints, when a model volunteers them, are layered on top so a
 * genuinely observed material ("terracotta tiles on the floor") can beat the
 * style baseline.
 */
export function extractMaterials(input: {
  styleId: string;
  roomType?: string | null;
  hints?: string[];
}): ExtractedMaterial[] {
  const tags: string[] = [...(findStyle(input.styleId)?.materialTags ?? [])];

  const room = (input.roomType ?? '').trim().toLowerCase();
  if (room && ROOM_EXTRA_TAGS[room]) {
    tags.push(...ROOM_EXTRA_TAGS[room]);
  }

  for (const hint of input.hints ?? []) {
    tags.push(...tagsFromHint(hint));
  }

  const unique = [...new Set(tags)].slice(0, MAX_MATERIALS);
  return unique.map((tag) => ({ tag, label: labelForTag(tag) }));
}

/**
 * Best-effort read of a free-text hint: a tag is only emitted when the same
 * sentence names both a surface and a material, so "warm lighting" produces
 * nothing instead of a junk tag that would query catalog for a product that
 * cannot exist.
 */
function tagsFromHint(hint: string): string[] {
  const text = hint.toLowerCase();
  const surface = Object.keys(SURFACE_UZ).find((key) => text.includes(key));
  const material = Object.keys(MATERIAL_UZ).find((key) => text.includes(key));
  if (!surface || !material) {
    return [];
  }
  const shade = Object.keys(SHADE_UZ).find((key) => text.includes(key.replace(/-/g, ' ')));
  return [shade ? `${surface}.${material}.${shade}` : `${surface}.${material}`];
}
