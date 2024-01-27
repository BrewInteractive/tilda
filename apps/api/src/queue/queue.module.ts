import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { PostHookQueue } from './post-hook.queue';
import { SendEmailQueue } from './send-email.queue';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    EmailModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('BULL_HOST'),
          port: configService.get<number>('BULL_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullBoardModule.forRoot({
      route: '/queue',
      adapter: ExpressAdapter,
    }),
  ],
  providers: [PostHookQueue, SendEmailQueue, QueueService],
})
export class QueueModule {}
