import type { UserRole } from './enums';

export interface UserDto {
  id: string;
  phone: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AddressDto {
  id: string;
  region: string;
  district: string;
  text: string;
  lat: number | null;
  lng: number | null;
}

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
