import { Process, Processor } from '@nestjs/bull';

@Processor('send-email')
export class SendEmailProcessor {
  @Process()
  async processSendEmail(job) {
    console.log('Processing send email:', job.data);
  }
}
