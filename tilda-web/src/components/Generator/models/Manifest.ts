import { Fields, FormConst, FormField, FormManifest, FormValidator } from ".";

export class Manifest {
  constructor() {
    this.data = {
      fields: {} as Fields,
    };
  }
  data: {
    fields: Fields;
  };

  static toForm(object: { manifest: Manifest }): FormManifest {
    const arr: FormField[] = [];

    for (const key in object.manifest.data.fields) {
      const fieldObj = object.manifest.data.fields[key];

      const constsObj = fieldObj.const;
      const constsArr: FormConst[] = [];
      for (const constKey in constsObj) {
        constsArr.push({
          isSecure: constKey.endsWith(":enc"),
          name: constKey.split(":")[0],
          value: constsObj[constKey],
        } as FormConst);
      }

      const validatorsObj = fieldObj.validators;
      const validatorsArr: FormValidator[] = [];
      for (const validatorKey in validatorsObj) {
        const validator = validatorsObj[validatorKey];
        validatorsArr.push({
          factory: validator.factory,
          minLength: validator.minLength,
          maxLength: validator.maxLength,
          onMatch: validator.onMatch,
          enumValues: validator.values,
          regex: validator.value,
        });
      }

      arr.push({
        name: key,
        label: fieldObj.ui?.label,
        inputName: fieldObj.inputName,
        const: constsArr,
        validators: validatorsArr,
      });
    }
    return {
      fields: arr,
      hooks: {
        pre: [],
        post: [],
      },
    };
  }
}
