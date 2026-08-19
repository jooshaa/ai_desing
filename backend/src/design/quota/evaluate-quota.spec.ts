import { evaluateQuota, startOfLocalDay, type QuotaLimits } from './evaluate-quota';

const limits: QuotaLimits = { userDailyLimit: 5, globalDailyLimit: 100, dailyBudgetUsd: 5 };
const fresh = { userRequestsToday: 0, globalRequestsToday: 0, spentTodayUsd: 0 };

describe('evaluateQuota', () => {
  it('allows a request when nothing is exhausted', () => {
    const decision = evaluateQuota(fresh, limits, 0.117);

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBeUndefined();
    expect(decision.remainingUserRequests).toBe(5);
  });

  it('blocks the user once their own daily limit is used up (AC-11)', () => {
    const decision = evaluateQuota({ ...fresh, userRequestsToday: 5 }, limits, 0.117);

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('user-daily-limit');
    expect(decision.remainingUserRequests).toBe(0);
  });

  it('blocks everyone once the global daily limit is used up', () => {
    const decision = evaluateQuota({ ...fresh, globalRequestsToday: 100 }, limits, 0.117);

    expect(decision.reason).toBe('global-daily-limit');
  });

  it('blocks when this request would push spend past the daily budget', () => {
    const decision = evaluateQuota({ ...fresh, spentTodayUsd: 4.95 }, limits, 0.117);

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('daily-budget');
    expect(decision.remainingBudgetUsd).toBe(0.05);
  });

  it('allows a request that exactly exhausts the remaining budget', () => {
    expect(evaluateQuota({ ...fresh, spentTodayUsd: 4.883 }, limits, 0.117).allowed).toBe(true);
  });

  it('reports the user limit first when several are exhausted at once', () => {
    const decision = evaluateQuota(
      { userRequestsToday: 5, globalRequestsToday: 100, spentTodayUsd: 5 },
      limits,
      0.117,
    );

    expect(decision.reason).toBe('user-daily-limit');
  });

  it('treats a negative limit as unlimited', () => {
    const unlimited = { userDailyLimit: -1, globalDailyLimit: -1, dailyBudgetUsd: -1 };
    const decision = evaluateQuota(
      { userRequestsToday: 999, globalRequestsToday: 9999, spentTodayUsd: 9999 },
      unlimited,
      10,
    );

    expect(decision.allowed).toBe(true);
  });

  it('treats a zero limit as a hard stop, not as unlimited', () => {
    const decision = evaluateQuota(fresh, { ...limits, userDailyLimit: 0 }, 0.117);

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('user-daily-limit');
  });

  it('allows a free request even with no budget left when the cost is zero', () => {
    const decision = evaluateQuota({ ...fresh, spentTodayUsd: 5 }, limits, 0);

    expect(decision.allowed).toBe(true);
  });
});

describe('startOfLocalDay', () => {
  const tashkent = 5;

  it('resets at local midnight, not UTC midnight', () => {
    const morning = new Date('2026-08-18T06:30:00Z');

    expect(startOfLocalDay(morning, tashkent).toISOString()).toBe('2026-08-17T19:00:00.000Z');
  });

  it('puts 02:00 local on the same local day as 23:00 local', () => {
    const lateNight = new Date('2026-08-18T18:00:00Z');
    const afterMidnight = new Date('2026-08-18T21:00:00Z');

    expect(startOfLocalDay(lateNight, tashkent).toISOString()).toBe('2026-08-17T19:00:00.000Z');
    expect(startOfLocalDay(afterMidnight, tashkent).toISOString()).toBe('2026-08-18T19:00:00.000Z');
  });

  it('matches UTC midnight when the offset is zero', () => {
    expect(startOfLocalDay(new Date('2026-08-18T06:30:00Z'), 0).toISOString()).toBe(
      '2026-08-18T00:00:00.000Z',
    );
  });
});
