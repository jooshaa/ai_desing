import type { Request } from 'express';
import type { UserRole } from '@imora/shared-types';

/**
 * Shape `core`'s JwtAuthGuard is expected to attach to `request.user` once
 * implemented (IMORA_TZ §4, row 1 — "core" owns auth). Catalog only reads
 * `id` and `role`; it does not implement token verification itself.
 */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  phone: string;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
