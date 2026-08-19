import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, type Job } from 'bullmq';
import { DesignGenerationService } from '../design-generation.service';
import { DesignJobQueue, type DesignJob } from './design-queue';

export const DESIGN_QUEUE_NAME = 'design-generate';

/**
 * BullMQ driver — the production path from IMORA_TZ §2 ("AI so'rovlari navbat
 * orqali").
 *
 * The queue and worker are constructed here rather than through
 * `BullModule.registerQueue` because that decorator runs at import time, before
 * `ConfigModule` has read `.env`, so it cannot be made conditional. Registering
 * it unconditionally would open a Redis connection on every machine without
 * Redis and bury the logs in reconnect errors. Building it by hand keeps the
 * choice at runtime and leaves `app.module.ts` (Tech Lead's file) untouched.
 */
@Injectable()
export class BullDesignQueue extends DesignJobQueue implements OnModuleInit, OnModuleDestroy {
  readonly driver = 'bull';
  private readonly logger = new Logger(BullDesignQueue.name);
  private readonly queue: Queue<DesignJob>;
  private worker?: Worker<DesignJob>;

  constructor(
    private readonly config: ConfigService,
    private readonly generation: DesignGenerationService,
  ) {
    super();
    this.queue = new Queue<DesignJob>(DESIGN_QUEUE_NAME, { connection: this.connection() });
  }

  onModuleInit(): void {
    this.worker = new Worker<DesignJob>(
      DESIGN_QUEUE_NAME,
      async (job: Job<DesignJob>) => this.generation.run(job.data.requestId),
      { connection: this.connection(), concurrency: Number(this.config.get('AI_CONCURRENCY', 2)) },
    );

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Design job ${job?.id} failed: ${error.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue.close();
  }

  async enqueue(job: DesignJob): Promise<void> {
    await this.queue.add('generate', job, {
      // Retries cost real money, so keep them few and spaced.
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
  }

  private connection(): { host: string; port: number } {
    return {
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: Number(this.config.get('REDIS_PORT', 6379)),
    };
  }
}
