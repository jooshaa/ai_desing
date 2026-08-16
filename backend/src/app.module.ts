import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CatalogModule } from './catalog/catalog.module';
import { CoreModule } from './core/core.module';
import { DesignModule } from './design/design.module';
import { HealthController } from './common/health.controller';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: Number(config.get('POSTGRES_PORT', 5432)),
        username: config.get<string>('POSTGRES_USER', 'imora'),
        password: config.get<string>('POSTGRES_PASSWORD', 'imora'),
        database: config.get<string>('POSTGRES_DB', 'imora'),
        autoLoadEntities: true,
        // Never enable synchronize — migrations only (IMORA_TZ §2).
        synchronize: false,
        migrationsRun: false,
        migrations: [__dirname + '/**/migrations/*.{ts,js}'],
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: Number(config.get('REDIS_PORT', 6379)),
        },
      }),
    }),
    CoreModule,
    CatalogModule,
    OrdersModule,
    DesignModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
