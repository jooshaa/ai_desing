import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedRequest, AuthenticatedUser } from './authenticated-request';

/**
 * Reads the authenticated user off the request. Two paths:
 *
 * 1. **Normal** — core's JwtAuthGuard has already populated `request.user`.
 *    This guard just asserts it is there.
 * 2. **Local dev seam** — core's `JwtAuthGuard` currently throws
 *    `UnauthorizedException` unconditionally (auth lands in core week-0), so
 *    putting it in the chain would make every design endpoint untestable and
 *    block AC-08 verification. When `NODE_ENV=development` *and*
 *    `DESIGN_DEV_USER_ID` is explicitly set, fall back to that user id.
 *
 * The bypass is impossible outside development: the NODE_ENV check comes first
 * and the env var has no default. See `design-auth.guard.spec.ts`.
 *
 * TODO(core): once core's JwtAuthGuard verifies real JWTs, replace
 * `@UseGuards(DesignAuthGuard)` with `@UseGuards(JwtAuthGuard)` and delete the
 * dev branch below.
 */
@Injectable()
export class DesignAuthGuard implements CanActivate {
  private readonly logger = new Logger(DesignAuthGuard.name);
  private warned = false;

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.id) {
      return true;
    }

    const devUser = this.resolveDevUser();
    if (!devUser) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!this.warned) {
      this.logger.warn(
        `DESIGN_DEV_USER_ID is set — design endpoints are running with a stub identity (${devUser.id}). Never set this outside local development.`,
      );
      this.warned = true;
    }
    request.user = devUser;
    return true;
  }

  private resolveDevUser(): AuthenticatedUser | null {
    if (this.config.get<string>('NODE_ENV') !== 'development') {
      return null;
    }
    const id = this.config.get<string>('DESIGN_DEV_USER_ID');
    if (!id) {
      return null;
    }
    return { id, role: 'user', phone: '+998000000000' };
  }
}
