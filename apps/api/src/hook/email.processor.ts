import { DataWithUiLabels } from '../manifest/models';
import { HookInterface } from './hook.interface';
import { HookService } from './hook.service';
import { EmailRequest } from './models';

export class EmailProcessor implements HookInterface {
  constructor(private readonly hookService: HookService) {}
  async execute(
    params: EmailRequest,
    dataWithUi: DataWithUiLabels[],
  ): Promise<void> {
    this.hookService.sendEmailAsync(params, dataWithUi);
  }
}
