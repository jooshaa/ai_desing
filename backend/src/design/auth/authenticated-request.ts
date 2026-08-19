import type { Request } from 'express';
import type { UserRole } from '@imora/shared-types';

/**
 * Shape core's JwtAuthGuard is expected to attach to `request.user`
 * (IMORA_TZ §4, row 1 — core owns auth). Design only reads `id`; it never
 * verifies tokens itself.
 *
 * Deliberately a local copy of `catalog/auth/authenticated-request.ts` rather
 * than a shared import: cross-module imports are what IMORA_TZ §5.2 forbids,
 * and `common/` is Tech Lead territory (§5.4). When core publishes a canonical
 * `AuthenticatedRequest`, delete this file and import that one.
 */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  phone: string;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
