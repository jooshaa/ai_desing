import { Logger, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DesignGenerationService } from '../design-generation.service';
import { DesignJobQueue } from './design-queue';
import { InlineDesignQueue } from './inline-design.queue';
import { BullDesignQueue } from './bull-design.queue';

export const designQueueFactory: Provider = {
  provide: DesignJobQueue,
  inject: [ConfigService, DesignGenerationService],
  useFactory: (config: ConfigService, generation: DesignGenerationService): DesignJobQueue => {
    const logger = new Logger('DesignQueue');
    const driver = (config.get<string>('DESIGN_QUEUE_DRIVER', 'inline') || 'inline')
      .trim()
      .toLowerCase();

    if (driver === 'bull') {
      logger.log('Design queue driver: bull (Redis)');
      return new BullDesignQueue(config, generation);
    }

    if (driver !== 'inline') {
      logger.warn(`DESIGN_QUEUE_DRIVER="${driver}" is unknown — using inline.`);
    } else {
      logger.log('Design queue driver: inline (no Redis; set DESIGN_QUEUE_DRIVER=bull for Redis)');
    }
    return new InlineDesignQueue(generation);
  },
};
