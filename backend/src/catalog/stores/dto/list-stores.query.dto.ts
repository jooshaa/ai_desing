import { IsIn, IsOptional } from 'class-validator';
import type { StoreStatus } from '@imora/shared-types';

const STORE_STATUSES: StoreStatus[] = ['pending', 'active', 'blocked'];

export class ListStoresQueryDto {
  @IsOptional()
  @IsIn(STORE_STATUSES)
  status?: StoreStatus;
}
