import type { DesignRequestStatus } from './enums';

export interface DesignStyleDto {
  id: string;
  name: string;
  promptHint: string;
}

export interface DesignVariantDto {
  id: string;
  imageUrl: string;
  sort: number;
}

export interface DesignMaterialDto {
  id: string;
  variantId: string;
  tag: string;
  label: string;
}

export interface DesignRequestDto {
  id: string;
  userId: string;
  inputImageUrl: string;
  roomType: string | null;
  style: string;
  note: string | null;
  status: DesignRequestStatus;
  apiCost: number;
  variants: DesignVariantDto[];
  createdAt: string;
}
