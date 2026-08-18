import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterStoreDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/)
  phone!: string;

  @IsString()
  @MaxLength(120)
  region!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  districts?: string[];

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
