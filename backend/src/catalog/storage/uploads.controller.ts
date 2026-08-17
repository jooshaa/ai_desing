import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';
import { UPLOAD_ROOT } from './local-disk-storage.service';

const SAFE_FOLDER = /^[a-zA-Z0-9_-]+$/;
const SAFE_FILENAME = /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i;

/**
 * Serves files written by LocalDiskStorageService. Only exists for local
 * dev without MinIO — a real object storage backend would serve these
 * directly and this controller would go away.
 */
@Controller('uploads/catalog')
export class UploadsController {
  @Get(':folder/:filename')
  serve(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): void {
    if (!SAFE_FOLDER.test(folder) || !SAFE_FILENAME.test(filename)) {
      throw new NotFoundException('File not found');
    }
    const path = join(UPLOAD_ROOT, folder, filename);
    if (!existsSync(path)) {
      throw new NotFoundException('File not found');
    }
    createReadStream(path).pipe(res);
  }
}
