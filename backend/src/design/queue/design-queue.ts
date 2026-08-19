export interface DesignJob {
  requestId: string;
}

/**
 * Hands a generation job off so the HTTP request can return 202 immediately.
 *
 * Two drivers exist because the team cannot all run Redis: `bull` is the
 * production path IMORA_TZ §2 specifies, `inline` runs the job in-process so a
 * clean clone works with nothing but Postgres. Callers never know which.
 */
export abstract class DesignJobQueue {
  abstract readonly driver: string;
  abstract enqueue(job: DesignJob): Promise<void>;
}
