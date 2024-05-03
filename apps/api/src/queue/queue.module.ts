import { ConfigModule, ConfigService } from '@nestjs/config';

import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bull';
import { EmailModule } from '../email/email.module';
import { ExpressAdapter } from '@bull-board/express';
import { HookModule } from '../hook/hook.module';
import { HookQueue } from './hook.queue';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    HookModule,
    EmailModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const bullConfig: any = {
          redis: {
            host: configService.get<string>('REDIS.HOST'),
            port: configService.get<number>('REDIS.PORT'),
            password: configService.get<string>('REDIS.PASSWORD'),
            username: configService.get<string>('REDIS.USERNAME'),
          },
        };

        const enableTLS = configService.get<boolean>('REDIS.TLS.ENABLE');
        const rejectUnauthorized = configService.get<boolean>(
          'REDIS.TLS.REJECT_UNAUTHORIZED',
        );

        if (enableTLS) {
          bullConfig.redis.tls = {
            rejectUnauthorized: rejectUnauthorized,
          };
        }

        return bullConfig;
      },
      inject: [ConfigService],
    }),
    BullBoardModule.forRoot({
      route: '/queue',
      adapter: ExpressAdapter,
    }),
  ],
  providers: [HookQueue],
})
export class QueueModule {}
