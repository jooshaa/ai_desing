import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { StorageService, type UploadableFile } from './storage.service';

export const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'catalog');

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/**
 * Saves files under backend/uploads/catalog/** and serves them back through
 * UploadsController — works fully offline, no Docker/MinIO needed locally.
 * Swap for an S3/MinIO implementation of StorageService once IMORA_TZ §11
 * (storage provider) is decided; callers only depend on the abstract class.
 */
@Injectable()
export class LocalDiskStorageService extends StorageService {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async upload(file: UploadableFile, folder: string): Promise<string> {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'misc';
    const ext = EXTENSION_BY_MIME[file.mimeType] ?? '.jpg';
    const filename = `${randomUUID()}${ext}`;

    const dir = join(UPLOAD_ROOT, safeFolder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), file.buffer);

    const port = this.config.get<string>('PORT', '3001');
    const base = this.config.get<string>('NEXT_PUBLIC_API_URL', `http://localhost:${port}/api`);
    return `${base}/uploads/catalog/${safeFolder}/${filename}`;
  }
}
