import { EmailRequest } from './models';
import { HookInterface } from './models/hook.interface';
import { HookResponse } from './models/hook-response.interface';
import { HookService } from './hook.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailProcessor implements HookInterface {
  constructor(private readonly hookService: HookService) {}
  async execute(params: EmailRequest): Promise<HookResponse> {
    this.hookService.sendEmailAsync(params);
    return {
      success: true,
      message: 'Email sent successfully',
    };
  }
}
