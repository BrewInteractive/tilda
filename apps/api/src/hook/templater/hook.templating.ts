import { Constants, HookParams } from '../../models';

export interface HookTemplatingInterface {
  applyTemplate(
    params: HookParams,
    templateKeyPairs: { [key: string]: string },
  ): void;
}

export abstract class HookTemplating implements HookTemplatingInterface {
  abstract applyTemplate(
    params: any,
    templateKeyPairs: { [key: string]: string },
  ): void;

  transformTemplateValues = (
    values: { [key: string]: string },
    output: { [key: string]: string },
  ): { [key: string]: string } => {
    const transformedValues: { [key: string]: string } = {};
    const valuesCopy = JSON.parse(JSON.stringify(values)) as {
      [key: string]: string;
    };
    const regexPattern = `\\{(?:\\${Constants.prefixPattern})?fields\\.([^}]+)\\}`;
    const fieldPlaceholderPattern = new RegExp(regexPattern);
    const globalFieldPlaceholderPattern = new RegExp(regexPattern, 'g');

    Object.entries(valuesCopy).forEach(([key, value]) => {
      const originalValue = value;
      const matches = originalValue.match(globalFieldPlaceholderPattern);

      if (matches) {
        let transformedValue = originalValue;
        matches.forEach((match) => {
          const fieldPattern = fieldPlaceholderPattern;
          const field = match
            .replace(fieldPattern, '$1')
            .replace('.value', '')
            .replace(Constants.encryptSuffix, '');
          transformedValue = transformedValue.replace(
            match,
            output[field] || output[field + Constants.encryptSuffix] || '',
          );
        });
        transformedValues[key] = transformedValue;
      } else {
        transformedValues[key] = value;
      }
    });
    return transformedValues;
  };
}
