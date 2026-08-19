export interface QuotaSnapshot {
  /** Requests this user already started today, excluding failed ones. */
  userRequestsToday: number;
  /** Requests everyone started today, excluding failed ones. */
  globalRequestsToday: number;
  /** Money actually booked today, including failed attempts. */
  spentTodayUsd: number;
}

export interface QuotaLimits {
  userDailyLimit: number;
  globalDailyLimit: number;
  dailyBudgetUsd: number;
}

export type QuotaDenialReason = 'user-daily-limit' | 'global-daily-limit' | 'daily-budget';

export interface QuotaDecision {
  allowed: boolean;
  reason?: QuotaDenialReason;
  message?: string;
  remainingUserRequests: number;
  remainingGlobalRequests: number;
  remainingBudgetUsd: number;
}

/** A negative limit disables that check; zero blocks everything. */
const UNLIMITED = -1;

function remaining(limit: number, used: number): number {
  return limit < 0 ? Number.POSITIVE_INFINITY : Math.max(0, limit - used);
}

/**
 * Decides whether one more design request may start (AC-11).
 *
 * Three independent guards, because they fail for different reasons:
 *   - per-user count stops one person draining the shared free allowance,
 *   - global count stops a traffic spike from doing the same,
 *   - the money cap is the one that actually matters. Counts are only a proxy
 *     for spend, and they stop being one the moment the model or the variant
 *     count changes, so the budget is checked against the real estimated cost
 *     of this request (IMORA_TZ §12 — "AI xarajati oshib ketadi. Pul yonadi").
 *
 * Checked user-first so the caller gets the message they can act on.
 */
export function evaluateQuota(
  snapshot: QuotaSnapshot,
  limits: QuotaLimits,
  estimatedCostUsd: number,
): QuotaDecision {
  const remainingUserRequests = remaining(limits.userDailyLimit, snapshot.userRequestsToday);
  const remainingGlobalRequests = remaining(limits.globalDailyLimit, snapshot.globalRequestsToday);
  const remainingBudgetUsd =
    limits.dailyBudgetUsd < 0
      ? Number.POSITIVE_INFINITY
      : Math.max(0, Number((limits.dailyBudgetUsd - snapshot.spentTodayUsd).toFixed(4)));

  const base = { remainingUserRequests, remainingGlobalRequests, remainingBudgetUsd };

  if (limits.userDailyLimit !== UNLIMITED && remainingUserRequests <= 0) {
    return {
      ...base,
      allowed: false,
      reason: 'user-daily-limit',
      message: `Daily free design limit reached (${limits.userDailyLimit} per day). Try again tomorrow.`,
    };
  }

  if (limits.globalDailyLimit !== UNLIMITED && remainingGlobalRequests <= 0) {
    return {
      ...base,
      allowed: false,
      reason: 'global-daily-limit',
      message: 'Imora has reached its daily AI generation limit. Please try again tomorrow.',
    };
  }

  if (limits.dailyBudgetUsd >= 0 && estimatedCostUsd > remainingBudgetUsd) {
    return {
      ...base,
      allowed: false,
      reason: 'daily-budget',
      message: 'Imora has reached its daily AI budget. Please try again tomorrow.',
    };
  }

  return { ...base, allowed: true };
}

/**
 * Start of the current day in the operating timezone. Limits are sold to users
 * as "N per day", so they have to reset at local midnight — resetting at UTC
 * midnight would land at 05:00 in Tashkent, mid-morning to the user.
 */
export function startOfLocalDay(now: Date, utcOffsetHours: number): Date {
  const shifted = new Date(now.getTime() + utcOffsetHours * 3600000);
  const midnightShifted = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  return new Date(midnightShifted - utcOffsetHours * 3600000);
}
