import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { HookQueue } from './hook.queue';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HookModule } from '../hook/hook.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    HookModule,
    EmailModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('BULL_HOST'),
          port: configService.get<number>('BULL_PORT'),
          password: configService.get<string>('BULL_PASSWORD'),
          username: configService.get<string>('BULL_USERNAME'),
          tls: {
            rejectUnauthorized: false,
          },
        },
      }),
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
