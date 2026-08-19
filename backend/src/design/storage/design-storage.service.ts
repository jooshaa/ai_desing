import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const DESIGN_UPLOAD_ROOT = join(process.cwd(), 'uploads', 'design');

export const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

export interface StoredFile {
  buffer: Buffer;
  mimeType: string;
}

export interface SavedFile {
  /** Public URL served by `DesignUploadsController`. */
  url: string;
  /** Absolute path on disk, so the generator can re-read the input without an HTTP round trip to ourselves. */
  path: string;
}

/**
 * Writes design inputs and generated variants under `backend/uploads/design/**`
 * and serves them back through `DesignUploadsController`. No Docker, no MinIO,
 * no S3 account needed to run the flow locally.
 *
 * A near-twin of catalog's `LocalDiskStorageService` on purpose: importing that
 * one would be exactly the cross-module coupling IMORA_TZ §5.2 forbids, and
 * `common/` needs Tech Lead sign-off (§5.4). When §11 settles MinIO vs R2, both
 * copies collapse into one shared S3 implementation.
 */
@Injectable()
export class DesignStorageService {
  constructor(private readonly config: ConfigService) {}

  async save(file: StoredFile, folder: string): Promise<SavedFile> {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'misc';
    const ext = EXTENSION_BY_MIME[file.mimeType] ?? '.jpg';
    const filename = `${randomUUID()}${ext}`;

    const dir = join(DESIGN_UPLOAD_ROOT, safeFolder);
    await mkdir(dir, { recursive: true });
    const path = join(dir, filename);
    await writeFile(path, file.buffer);

    return { url: `${this.publicBase()}/uploads/design/${safeFolder}/${filename}`, path };
  }

  /**
   * Maps a public URL this service produced back to its file on disk, so the
   * generator can read the source photo directly instead of making the API
   * call itself over HTTP. Returns null for anything that is not one of ours.
   */
  resolveLocalPath(url: string): string | null {
    const match = /\/uploads\/design\/([a-zA-Z0-9_-]+)\/([a-f0-9-]{36}\.[a-z]+)$/i.exec(url);
    if (!match) {
      return null;
    }
    return join(DESIGN_UPLOAD_ROOT, match[1], match[2]);
  }

  private publicBase(): string {
    const port = this.config.get<string>('PORT', '3001');
    return this.config.get<string>('NEXT_PUBLIC_API_URL', `http://localhost:${port}/api`);
  }
}
