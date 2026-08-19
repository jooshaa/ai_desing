import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignRequest } from './requests/design-request.entity';
import { DesignVariant } from './variants/design-variant.entity';
import { DesignMaterial } from './materials/design-material.entity';
import { DesignController } from './design.controller';
import { DesignService } from './design.service';
import { DesignGenerationService } from './design-generation.service';
import { DesignAuthGuard } from './auth/design-auth.guard';
import { QuotaService } from './quota/quota.service';
import { DesignStorageService } from './storage/design-storage.service';
import { DesignUploadsController } from './storage/design-uploads.controller';
import { DesignPlaygroundController } from './dev/design-playground.controller';
import { aiDesignProviderFactory } from './providers/provider.factory';
import { designQueueFactory } from './queue/design-queue.factory';

/**
 * Note there is no `BullModule.registerQueue` here. The queue driver is chosen
 * at runtime from `DESIGN_QUEUE_DRIVER` (see `design-queue.factory.ts`), which
 * a module decorator cannot do — it is evaluated before ConfigModule reads
 * `.env`. `BullDesignQueue` builds its own BullMQ Queue and Worker instead, so
 * machines without Redis open no connection at all and `app.module.ts` (Tech
 * Lead's file, IMORA_TZ §5.4) needs no change.
 */
@Module({
  imports: [TypeOrmModule.forFeature([DesignRequest, DesignVariant, DesignMaterial])],
  controllers: [DesignController, DesignUploadsController, DesignPlaygroundController],
  providers: [
    DesignService,
    DesignGenerationService,
    DesignStorageService,
    QuotaService,
    DesignAuthGuard,
    aiDesignProviderFactory,
    designQueueFactory,
  ],
  exports: [DesignService],
})
export class DesignModule {}
