import { DataCordParams } from '../models';
import { HookTemplating } from './hook.templating';

export class DataCordTemplating extends HookTemplating {
  //override applyToTemplate in abstract base class
  applyTemplate(
    params: DataCordParams,
    templateKeyPairs: { [key: string]: string },
  ): void {
    params.values = this.transformTemplateValues(
      params.values,
      templateKeyPairs,
    );
  }
}
