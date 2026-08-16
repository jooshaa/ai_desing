import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { DesignRequest } from './requests/design-request.entity';
import { DesignVariant } from './variants/design-variant.entity';
import { DesignMaterial } from './materials/design-material.entity';
import { DesignController } from './design.controller';
import { DesignService } from './design.service';
import { DesignProcessor } from './queue/design.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([DesignRequest, DesignVariant, DesignMaterial]),
    BullModule.registerQueue({ name: 'design-generate' }),
  ],
  controllers: [DesignController],
  providers: [DesignService, DesignProcessor],
})
export class DesignModule {}
