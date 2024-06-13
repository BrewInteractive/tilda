import { Fields, FormField, FormHooks, Manifest, Validator } from ".";

export class FormManifest {
  constructor() {
    this.fields = [];
    this.hooks = {} as FormHooks;
  }

  fields: FormField[];
  hooks?: FormHooks;

  static toManifest(formData: FormManifest): Manifest {
    const fields: Fields = {};

    formData.fields.forEach((element) => {
      const constObject: {
        [key: string]: string;
      } = {};
      element.const.forEach((c) => {
        const suffix = c.isSecure ? ":enc" : "";
        constObject[c.name + suffix] = c.value;
      });

      const validatorsArr: Validator[] = [];

      element.validators.forEach((v) => {
        const validator: Validator = {
          factory: v.factory,
        };
        if (v.factory === "length") {
          validator.minLength = v.minLength;
          validator.maxLength = v.maxLength;
        }
        if (v.factory === "regex") {
          validator.value = v.regex;
          validator.onMatch = v.onMatch;
        }
        if (v.factory === "enum") {
          validator.values = v.enumValues;
        }
        validatorsArr.push(validator);
      });

      fields[element.name] = {
        inputName: element.inputName,
        ui: {
          label: element.label,
        },
        const: constObject,
        validators: validatorsArr,
      };
    });

    return {
      data: {
        fields: fields,
      },
    } as Manifest;
  }
}
