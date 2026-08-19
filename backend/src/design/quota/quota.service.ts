import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { DesignRequest } from '../requests/design-request.entity';
import {
  evaluateQuota,
  startOfLocalDay,
  type QuotaDecision,
  type QuotaLimits,
  type QuotaSnapshot,
} from './evaluate-quota';

/** Tashkent. Overridable so the same code can run for another market later. */
const DEFAULT_UTC_OFFSET_HOURS = 5;
/** Deliberately small: the team has no AI budget yet, so the default cannot bite. */
const DEFAULT_DAILY_BUDGET_USD = 1;

@Injectable()
export class QuotaService {
  constructor(
    @InjectRepository(DesignRequest)
    private readonly requests: Repository<DesignRequest>,
    private readonly config: ConfigService,
  ) {}

  limits(): QuotaLimits {
    return {
      userDailyLimit: this.number('AI_USER_DAILY_LIMIT', 5),
      globalDailyLimit: this.number('AI_DAILY_LIMIT', 100),
      dailyBudgetUsd: this.number('AI_DAILY_BUDGET_USD', DEFAULT_DAILY_BUDGET_USD),
    };
  }

  async check(userId: string, estimatedCostUsd: number): Promise<QuotaDecision> {
    const snapshot = await this.snapshot(userId);
    return evaluateQuota(snapshot, this.limits(), estimatedCostUsd);
  }

  async snapshot(userId: string, now: Date = new Date()): Promise<QuotaSnapshot> {
    const since = startOfLocalDay(now, this.number('AI_TZ_OFFSET_HOURS', DEFAULT_UTC_OFFSET_HOURS));

    // A request that failed on the provider side does not burn the user's free
    // allowance — but whatever it cost is still real money, so `spentTodayUsd`
    // counts every row.
    const [userRequestsToday, globalRequestsToday, spent] = await Promise.all([
      this.requests.count({
        where: { userId, createdAt: MoreThanOrEqual(since), status: Not('failed') },
      }),
      this.requests.count({
        where: { createdAt: MoreThanOrEqual(since), status: Not('failed') },
      }),
      this.requests
        .createQueryBuilder('request')
        .select('COALESCE(SUM(request."apiCost"), 0)', 'total')
        .where('request."createdAt" >= :since', { since })
        .getRawOne<{ total: string }>(),
    ]);

    return {
      userRequestsToday,
      globalRequestsToday,
      spentTodayUsd: Number(spent?.total ?? 0),
    };
  }

  private number(key: string, fallback: number): number {
    const raw = this.config.get<string>(key);
    if (raw === undefined || raw === null || `${raw}`.trim() === '') {
      return fallback;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
