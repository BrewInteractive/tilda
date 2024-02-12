import { TildaManifest } from '../../models';

export const manifest = {
  hmac: '333ef77fb10b9d93109df95ba723845639ffe6cbf7d791daab144cb75d056318',
  data: {
    fields: {
      name: {
        inputName: '',
        ui: {
          label: 'Name',
        },
        const: {
          constName1: 'const value',
        },
        validators: [
          {
            factory: 'alpha',
          },
        ],
      },
      surname: {
        inputName: '',
        ui: {
          label: 'Surname',
        },
        const: {
          'constName2:enc':
            '3e1c4ff9b10397d449f462387a8aca13:d08f5019fa88399af0d51fd058e3ed5b91e80aa04edebf66b8b75dd01262c591cf3e75267a4f4d588bba1bef9522b4aa47956b82bee26685bfed5571c71ee99fe1c8c004141c0356397f8efa3d6bc8c4',
        },
        validators: [
          {
            factory: 'alpha',
          },
        ],
      },
    },
    hooks: {
      pre: [
        {
          factory: 'webhook',
          params: {
            url: '',
            headers: [],
            method: 'post',
            values: {
              nameSurname: '{$.fields.name.value} {$.fields.surname.value}',
            },
          },
        },
      ],
      post: [
        {
          factory: 'email',
          params: {
            recipients: [
              {
                'email:enc':
                  'c0db2e8955352732c3a2f4f7a9de902a:2c6871ba84b86ee5d9b1d96d9378328671c040c3ce18aac8f05c0e8fe11a037b6ee17bb8f7c4854ba17335a498ab5edbd73874dea2bee899618a6ec51da35ccdd7320c5b945f57c0a805695c8fed00406a5820c3e38f99ee8019f0b1503282ed04dd5ccdcfa0b220ea9dc3dd8163e9db',
              },
            ],
          },
        },
      ],
    },
  },
} as TildaManifest;
export const oneMoreValidatorsManifest = {
  hmac: '333ef77fb10b9d93109df95ba723845639ffe6cbf7d791daab144cb75d056318',
  data: {
    fields: {
      name: {
        inputName: '',
        ui: {
          label: 'Name',
        },
        const: {
          constName1: 'const value',
        },
        validators: [
          {
            factory: 'alpha',
          },
          {
            factory: 'regex',
            params: {
              regex: '^.{3,10}$',
            },
          },
        ],
      },
      surname: {
        inputName: '',
        ui: {
          label: 'Surname',
        },
        const: {
          'constName2:enc':
            '3e1c4ff9b10397d449f462387a8aca13:d08f5019fa88399af0d51fd058e3ed5b91e80aa04edebf66b8b75dd01262c591cf3e75267a4f4d588bba1bef9522b4aa47956b82bee26685bfed5571c71ee99fe1c8c004141c0356397f8efa3d6bc8c4',
        },
        validators: [
          {
            factory: 'alpha',
          },
          {
            factory: 'regex',
            params: {
              regex: '^.{3,10}$',
            },
          },
        ],
      },
    },
    hooks: {
      pre: [
        {
          factory: 'webhook',
          params: {
            url: '',
            headers: [],
            method: 'post',
            values: {
              nameSurname: '{$.fields.name.value} {$.fields.surname.value}',
            },
          },
        },
      ],
      post: [
        {
          factory: 'email',
          params: {
            recipients: [
              {
                'email:enc':
                  'c0db2e8955352732c3a2f4f7a9de902a:2c6871ba84b86ee5d9b1d96d9378328671c040c3ce18aac8f05c0e8fe11a037b6ee17bb8f7c4854ba17335a498ab5edbd73874dea2bee899618a6ec51da35ccdd7320c5b945f57c0a805695c8fed00406a5820c3e38f99ee8019f0b1503282ed04dd5ccdcfa0b220ea9dc3dd8163e9db',
              },
            ],
          },
        },
      ],
    },
  },
} as TildaManifest;
