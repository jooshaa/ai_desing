import { DEFAULT_STYLE_ID, findStyle } from './styles';

export interface BuildPromptInput {
  style: string;
  roomType?: string | null;
  note?: string | null;
  /** Variant index — nudges each of the 3 variants in a different direction (AC-08). */
  variantIndex?: number;
}

export interface BuiltPrompt {
  prompt: string;
  negativePrompt: string;
}

/** How far each of the three variants drifts from the base style. */
const VARIANT_DIRECTIONS = [
  'balanced interpretation of the style',
  'lighter and airier interpretation, more daylight and paler finishes',
  'warmer and cosier interpretation, deeper accent tones and textile layers',
];

const MAX_NOTE_LENGTH = 300;

const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
const HIJACK_PHRASES = /\b(ignore|disregard|forget)\s+(all\s+)?(the\s+)?(above|previous|prior)\b/gi;
const ROLE_PREFIX = /\b(system|assistant|developer)\s*:/gi;

/**
 * User notes are pasted straight into a prompt sent to a third-party model, so
 * they are untrusted input: drop control characters, strip the phrasings people
 * use to hijack an instruction ("ignore the above", "system:"), collapse
 * whitespace and cap the length. The note is then quoted as a *preference*, not
 * as an instruction, so the structural constraints always win.
 */
export function sanitiseNote(note: string | null | undefined): string {
  if (!note) {
    return '';
  }
  return note
    .replace(CONTROL_CHARS, ' ')
    .replace(HIJACK_PHRASES, '')
    .replace(ROLE_PREFIX, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NOTE_LENGTH);
}

/**
 * Pure prompt builder — kept out of the provider adapters so prompt wording can
 * be iterated and unit tested without spending API money (IMORA_TZ §7, stage 1
 * "prompt tajribalari").
 *
 * The non-negotiable half of the prompt is the *structure lock*: Imora shows a
 * redesign of the user's own room, so walls, windows, door positions, ceiling
 * height and camera angle must survive — a redesign of a different room is
 * worthless for picking materials. Everything the model may change is listed
 * explicitly, and everything it must not touch is repeated in the negative
 * prompt, because img2img models weight negatives separately from the prompt.
 */
export function buildPrompt(input: BuildPromptInput): BuiltPrompt {
  const style = findStyle(input.style) ?? findStyle(DEFAULT_STYLE_ID);
  const direction = VARIANT_DIRECTIONS[(input.variantIndex ?? 0) % VARIANT_DIRECTIONS.length];
  const room = (input.roomType ?? '').trim() || 'room';
  const note = sanitiseNote(input.note);

  const parts = [
    `Interior redesign of this ${room}, photorealistic.`,
    `Style: ${style?.name ?? 'Modern'} - ${style?.promptHint ?? ''}.`,
    `Direction: ${direction}.`,
    'Keep the existing architecture exactly: same camera angle and focal length, same wall positions, same window and door positions and sizes, same ceiling height, same room proportions.',
    'You may change: wall finish, floor finish, ceiling finish, furniture, textiles, lighting fixtures, decor and colour palette.',
    'Realistic materials and lighting consistent with the windows already in the photo.',
  ];

  if (note) {
    parts.push(
      `User preference (apply only where it does not conflict with the above): "${note}".`,
    );
  }

  return {
    prompt: parts.join(' '),
    negativePrompt: [
      'changing room geometry',
      'moving or removing windows or doors',
      'new walls',
      'different camera angle',
      'fisheye distortion',
      'text',
      'watermark',
      'people',
      'blurry',
      'low quality',
      'cartoon',
    ].join(', '),
  };
}
