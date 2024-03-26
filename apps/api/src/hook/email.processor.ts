import { EmailRequest } from './models';
import { HookInterface } from './hook.interface';
import { HookService } from './hook.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailProcessor implements HookInterface {
  constructor(private readonly hookService: HookService) {}
  async execute(params: EmailRequest): Promise<void> {
    this.hookService.sendEmailAsync(params);
  }
}
