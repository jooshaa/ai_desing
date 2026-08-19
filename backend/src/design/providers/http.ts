import { AiProviderError } from './ai-provider';

/** Anything slower than this is worse than useless — AC-08 budgets 90s total. */
export const PROVIDER_TIMEOUT_MS = 60_000;

/** 4xx are our fault (bad key, bad request) and must not be retried blindly. */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * `fetch` with a hard timeout, mapped into `AiProviderError`. Every provider
 * call goes through here so a hung vendor can never pin a queue worker
 * forever — the job fails, the request is marked failed, and the rest of the
 * app keeps serving (AC-10).
 */
export async function providerFetch(
  provider: string,
  url: string,
  init: RequestInit,
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (cause) {
    const aborted = cause instanceof Error && cause.name === 'AbortError';
    throw new AiProviderError(
      aborted
        ? `${provider} timed out after ${timeoutMs}ms`
        : `${provider} request failed: ${cause instanceof Error ? cause.message : 'unknown error'}`,
      provider,
      true,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AiProviderError(
      `${provider} returned ${response.status}: ${body.slice(0, 300)}`,
      provider,
      isRetryableStatus(response.status),
    );
  }

  return response;
}

export function toDataUri(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
