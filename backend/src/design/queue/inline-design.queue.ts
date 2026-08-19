import { Injectable, Logger } from '@nestjs/common';
import { DesignGenerationService } from '../design-generation.service';
import { DesignJobQueue, type DesignJob } from './design-queue';

/**
 * Runs the job in this process, immediately after the response is sent.
 *
 * Default driver, because Redis needs Docker and Docker is not available on
 * every teammate's machine — with `bull` as the default, a fresh clone would
 * accept design requests that silently never run. It has no retries and no
 * cross-process fan-out, so production sets `DESIGN_QUEUE_DRIVER=bull`.
 */
@Injectable()
export class InlineDesignQueue extends DesignJobQueue {
  readonly driver = 'inline';
  private readonly logger = new Logger(InlineDesignQueue.name);

  constructor(private readonly generation: DesignGenerationService) {
    super();
  }

  async enqueue(job: DesignJob): Promise<void> {
    // Detached on purpose: awaiting here would hold the HTTP response open for
    // the full generation. `run()` records its own failures, so the only thing
    // that can reach this catch is a bug in that recording.
    setImmediate(() => {
      void this.generation.run(job.requestId).catch((error: unknown) => {
        this.logger.error(
          `Inline generation crashed for ${job.requestId}: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      });
    });
  }
}
