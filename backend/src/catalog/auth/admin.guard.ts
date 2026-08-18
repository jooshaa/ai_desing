import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from './authenticated-request';

/**
 * Runs after core's JwtAuthGuard (which must populate `request.user`).
 * Restricts a route to role === 'admin'. Lives in catalog because the two
 * catalog admin actions (store approval, category management) are the only
 * admin-only endpoints this module exposes — a general RolesGuard belongs in
 * `common/`, which is Tech Lead territory (IMORA_TZ §5.4).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
