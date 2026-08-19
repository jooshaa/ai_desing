import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { ExecutionContext } from '@nestjs/common';
import { DesignAuthGuard } from './design-auth.guard';

function configWith(values: Record<string, string>): ConfigService {
  return {
    get: (key: string, fallback?: unknown): unknown => values[key] ?? fallback,
  } as unknown as ConfigService;
}

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('DesignAuthGuard', () => {
  const devUserId = '11111111-1111-4111-8111-111111111111';

  it('passes through when core has already populated request.user', () => {
    const request = { user: { id: 'real-user', role: 'user', phone: '+998901234567' } };

    expect(new DesignAuthGuard(configWith({})).canActivate(contextFor(request))).toBe(true);
    expect(request.user.id).toBe('real-user');
  });

  it('rejects an anonymous request when no dev seam is configured', () => {
    const guard = new DesignAuthGuard(configWith({ NODE_ENV: 'development' }));

    expect(() => guard.canActivate(contextFor({}))).toThrow(UnauthorizedException);
  });

  it('injects the configured stub user in development', () => {
    const guard = new DesignAuthGuard(
      configWith({ NODE_ENV: 'development', DESIGN_DEV_USER_ID: devUserId }),
    );
    const request: Record<string, unknown> = {};

    expect(guard.canActivate(contextFor(request))).toBe(true);
    expect(request.user).toMatchObject({ id: devUserId, role: 'user' });
  });

  it('never honours the dev seam in production, even with the id set', () => {
    const guard = new DesignAuthGuard(
      configWith({ NODE_ENV: 'production', DESIGN_DEV_USER_ID: devUserId }),
    );

    expect(() => guard.canActivate(contextFor({}))).toThrow(UnauthorizedException);
  });

  it('never honours the dev seam when NODE_ENV is unset', () => {
    const guard = new DesignAuthGuard(configWith({ DESIGN_DEV_USER_ID: devUserId }));

    expect(() => guard.canActivate(contextFor({}))).toThrow(UnauthorizedException);
  });
});
