import { Controller, Get } from '@nestjs/common';
import { DesignService } from './design.service';

@Controller('design')
export class DesignController {
  constructor(private readonly design: DesignService) {}

  @Get('styles')
  styles() {
    return this.design.listStyles();
  }
}
