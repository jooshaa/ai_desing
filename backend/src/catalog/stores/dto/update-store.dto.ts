import { PartialType } from '@nestjs/mapped-types';
import { RegisterStoreDto } from './register-store.dto';

export class UpdateStoreDto extends PartialType(RegisterStoreDto) {}
