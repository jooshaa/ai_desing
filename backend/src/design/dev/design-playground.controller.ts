import { Controller, Get, NotFoundException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { PLAYGROUND_HTML } from './playground.html';

/**
 * Serves the dev test harness. Gated on NODE_ENV=development and returns 404
 * anywhere else — it drives real, billable generations with no auth of its own,
 * so it must not exist on a deployed server.
 */
@Controller('design/dev')
export class DesignPlaygroundController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  page(@Res() res: Response): void {
    if (this.config.get<string>('NODE_ENV') !== 'development') {
      throw new NotFoundException();
    }
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.send(PLAYGROUND_HTML);
  }
}
