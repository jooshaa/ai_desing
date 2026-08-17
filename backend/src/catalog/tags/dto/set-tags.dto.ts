import { ArrayMaxSize, IsArray, IsString, MaxLength } from 'class-validator';

export class SetTagsDto {
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  tags!: string[];
}
