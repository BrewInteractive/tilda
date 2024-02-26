import { HookInterface } from './hook.interface';
import { HookService } from './hook.service';

export class EmailProcessor implements HookInterface {
  constructor(private readonly hookService: HookService) {}
  async execute(params: any, dataWithUi: any): Promise<any> {
    return this.hookService.sendEmailAsync(params, dataWithUi);
  }
}
