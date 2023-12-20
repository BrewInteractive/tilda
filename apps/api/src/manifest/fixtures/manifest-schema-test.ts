import { TildaManifest } from '../../models';

export const validManifest = {
  hmac: '',
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
            factory: 'numeric',
          },
        ],
      },
      surname: {
        inputName: '',
        ui: {
          label: 'Surname',
        },
        const: {
          'constName2:enc': 'encrypted value',
        },
        validators: [
          {
            factory: 'numeric',
          },
        ],
      },
    },
    hooks: {
      pre: [
        {
          factory: 'webhook',
          params: {
            url: 'test.example.com',
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
                'email:enc': 'example@mail.com',
              },
            ],
          },
        },
      ],
    },
  },
} as TildaManifest;
export const requiredFieldMissingManifest = {
  hmac: '',
  data: {
    fields: {},
    hooks: {
      pre: [
        {
          factory: 'webhook',
          params: {
            url: 'test.example.com',
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
                'email:enc': 'example@mail.com',
              },
            ],
          },
        },
      ],
    },
  },
} as TildaManifest;
export const requiredHookMissingManifest = {
  hmac: '',
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
            factory: 'numeric',
          },
        ],
      },
      surname: {
        inputName: '',
        ui: {
          label: 'Surname',
        },
        const: {
          'constName2:enc': 'encrypted value',
        },
        validators: [
          {
            factory: 'numeric',
          },
        ],
      },
    },
    hooks: {},
  },
} as TildaManifest;
export const requiredPreHookParamsForMissingUrl = {
  hmac: '',
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
            factory: 'numeric',
          },
        ],
      },
      surname: {
        inputName: '',
        ui: {
          label: 'Surname',
        },
        const: {
          'constName2:enc': 'encrypted value',
        },
        validators: [
          {
            factory: 'numeric',
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
                'email:enc': 'example@mail.com',
              },
            ],
          },
        },
      ],
    },
  },
} as TildaManifest;
export const requiredPostHookParamsForMissingEmail = {
  hmac: '',
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
            factory: 'numeric',
          },
        ],
      },
      surname: {
        inputName: '',
        ui: {
          label: 'Surname',
        },
        const: {
          'constName2:enc': 'encrypted value',
        },
        validators: [
          {
            factory: 'numeric',
          },
        ],
      },
    },
    hooks: {
      pre: [
        {
          factory: 'webhook',
          params: {
            url: 'test.example.com',
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
            recipients: null,
          },
        },
      ],
    },
  },
} as TildaManifest;
export const requiredPostHookInvalidEmailRegex = {
  hmac: '',
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
            factory: 'numeric',
          },
        ],
      },
      surname: {
        inputName: '',
        ui: {
          label: 'Surname',
        },
        const: {
          'constName2:enc': 'encrypted value',
        },
        validators: [
          {
            factory: 'numeric',
          },
        ],
      },
    },
    hooks: {
      pre: [
        {
          factory: 'webhook',
          params: {
            url: 'test.example.com',
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
                'email:enc': 'examplemail.com',
              },
            ],
          },
        },
      ],
    },
  },
} as TildaManifest;
