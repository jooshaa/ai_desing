import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DESIGN_STYLES } from '../prompts/styles';

const STYLE_IDS = DESIGN_STYLES.map((style) => style.id);

/**
 * Multipart fields arrive as strings, so there is nothing to transform here —
 * only to constrain. `style` is validated against the shipped library rather
 * than accepted free-form: an unknown style would silently fall back to
 * "modern" in the prompt builder and the user would wonder why they got the
 * wrong design.
 */
export class CreateDesignRequestDto {
  @IsString()
  @IsIn(STYLE_IDS, { message: `style must be one of: ${STYLE_IDS.join(', ')}` })
  style!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  roomType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
