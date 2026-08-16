import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('design-generate')
export class DesignProcessor extends WorkerHost {
  private readonly logger = new Logger(DesignProcessor.name);

  async process(job: Job<{ requestId: string }>): Promise<void> {
    this.logger.log(`scaffold job ${job.id} for request ${job.data.requestId}`);
  }
}
