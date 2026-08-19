import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';
import { DESIGN_UPLOAD_ROOT } from './design-storage.service';

const SAFE_FOLDER = /^[a-zA-Z0-9_-]+$/;
const SAFE_FILENAME = /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|svg)$/i;

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

/**
 * Serves files written by `DesignStorageService`. Local-dev only — real object
 * storage would serve these directly and this controller would be deleted.
 *
 * Both path segments are matched against a strict allowlist before touching
 * disk: the filename must be a UUID with a known image extension, so no
 * traversal or arbitrary-file read is reachable from a crafted URL.
 */
@Controller('uploads/design')
export class DesignUploadsController {
  @Get(':folder/:filename')
  serve(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): void {
    if (!SAFE_FOLDER.test(folder) || !SAFE_FILENAME.test(filename)) {
      throw new NotFoundException('File not found');
    }

    const path = join(DESIGN_UPLOAD_ROOT, folder, filename);
    if (!existsSync(path)) {
      throw new NotFoundException('File not found');
    }

    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    res.setHeader('content-type', CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream');
    createReadStream(path).pipe(res);
  }
}
