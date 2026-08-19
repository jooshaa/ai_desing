import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { AiDesignProvider, type GenerateVariantInput, type GeneratedVariant } from './ai-provider';
import { PRICE_PER_IMAGE_USD } from './estimate-cost';

/**
 * Default provider. Costs nothing, needs no key and no network, so every
 * teammate can run the full upload -> queue -> variants -> materials flow on
 * `pnpm dev` without an AI account — and CI can exercise it too.
 *
 * It deliberately renders an obvious placeholder card rather than anything
 * that could pass for a real render: a fake "design" shown to a user testing
 * the product would poison exactly the signal the 7-day validation test is
 * trying to measure.
 */
@Injectable()
export class StubDesignProvider extends AiDesignProvider {
  readonly id = 'stub';
  readonly model = 'stub';
  readonly pricePerImageUsd = PRICE_PER_IMAGE_USD.stub;
  readonly preservesRoomStructure = false;

  async generate(input: GenerateVariantInput): Promise<GeneratedVariant> {
    // Hue derives from the prompt so the same request always renders the same
    // placeholder — makes the flow reproducible in tests and demos.
    const digest = createHash('sha256').update(input.prompt).digest();
    const hue = digest[0] * (360 / 256);
    const label = `Variant ${input.variantIndex + 1}`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="768" viewBox="0 0 1024 768">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${hue.toFixed(0)} 40% 82%)"/>
      <stop offset="100%" stop-color="hsl(${hue.toFixed(0)} 30% 62%)"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="768" fill="url(#g)"/>
  <rect x="64" y="64" width="896" height="640" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="3" stroke-dasharray="14 10"/>
  <text x="512" y="352" font-family="system-ui, sans-serif" font-size="52" font-weight="600" fill="rgba(0,0,0,.72)" text-anchor="middle">IMORA STUB</text>
  <text x="512" y="416" font-family="system-ui, sans-serif" font-size="30" fill="rgba(0,0,0,.6)" text-anchor="middle">${label} - no AI provider configured</text>
  <text x="512" y="464" font-family="system-ui, sans-serif" font-size="22" fill="rgba(0,0,0,.5)" text-anchor="middle">Set AI_PROVIDER to generate real designs</text>
</svg>`;

    return {
      buffer: Buffer.from(svg, 'utf8'),
      mimeType: 'image/svg+xml',
      materialHints: [],
    };
  }
}
