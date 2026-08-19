/**
 * Cloudflare documents the klein input limit as "smaller than 512x512", so the
 * target is strictly under 512 rather than exactly 512.
 */
export const KLEIN_MAX_INPUT_EDGE = 511;

export interface FittedDimensions {
  width: number;
  height: number;
  needsResize: boolean;
}

/**
 * Largest size that fits inside a `maxEdge` square while keeping aspect ratio.
 *
 * Split out from the jimp call so it can be unit tested: jimp 1.x is ESM and
 * cannot be loaded inside Jest's CommonJS sandbox without changing the shared
 * Jest config, which needs Tech Lead sign-off (IMORA_TZ §5.4). The arithmetic
 * is the part that can silently be wrong, so that is the part under test; the
 * decode/encode round trip is covered by the live provider test instead.
 */
export function fitDimensions(
  width: number,
  height: number,
  maxEdge: number = KLEIN_MAX_INPUT_EDGE,
): FittedDimensions {
  if (width <= 0 || height <= 0) {
    throw new RangeError('Image dimensions must be positive');
  }

  if (width <= maxEdge && height <= maxEdge) {
    return { width, height, needsResize: false };
  }

  const scale = maxEdge / Math.max(width, height);
  return {
    // Never round down to 0 on an extreme aspect ratio (a panorama).
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    needsResize: true,
  };
}

export interface ResizedImage {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  /** False when the source already fitted and was passed through untouched. */
  resized: boolean;
}

/**
 * Shrinks a room photo to fit the provider's input cap. Images that already fit
 * are returned byte-for-byte — re-encoding a small JPEG only loses quality.
 *
 * Uses jimp rather than sharp because sharp needs a native build step that pnpm
 * currently declines to run for this workspace; adding it would mean a root
 * config change and a broken install for every teammate who does not re-approve
 * it. jimp is pure JavaScript and installs identically everywhere.
 */
export async function resizeToFit(
  buffer: Buffer,
  mimeType: string,
  maxEdge: number = KLEIN_MAX_INPUT_EDGE,
): Promise<ResizedImage> {
  const { Jimp } = await import('jimp');
  const image = await Jimp.read(buffer);
  const target = fitDimensions(image.bitmap.width, image.bitmap.height, maxEdge);

  if (!target.needsResize) {
    return { buffer, mimeType, width: target.width, height: target.height, resized: false };
  }

  image.resize({ w: target.width, h: target.height });

  // Always hand back JPEG: every provider accepts it, and a downscaled photo
  // has nothing to gain from PNG.
  const out = await image.getBuffer('image/jpeg', { quality: 90 });
  return {
    buffer: Buffer.from(out),
    mimeType: 'image/jpeg',
    width: target.width,
    height: target.height,
    resized: true,
  };
}
