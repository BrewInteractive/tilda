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
export const encryptedValidManifest = {
  hmac: '44a98ec59c22d24b6b6a612b4acd90f68180237412e4c3e01dd1f913542dc9c4',
  data: {
    fields: {
      name: {
        inputName: '',
        ui: { label: 'Name' },
        const: { constName1: 'const value' },
        validators: [{ factory: 'alpha' }],
      },
      surname: {
        inputName: '',
        ui: { label: 'Surname' },
        const: {
          'constName2:enc':
            'd2f9641add34ca1f65f20d38:efb52d71d555b6183b4eeaa8d21341:683dd0ae0f63f87f0a54d05d1563d5a7',
        },
        validators: [{ factory: 'alpha' }],
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
                'email:enc':
                  '24b5b244948a45caa4415a15:9283a0fdfbbb6e3a804fe5ebb938bfcf:872cc965688f2299bc67cd67105423c1',
              },
            ],
          },
        },
      ],
    },
  },
} as TildaManifest;
export const validManifestBase64 =
  'ICAgICAgeyJobWFjIjoiIiwiZGF0YSI6eyJmaWVsZHMiOnsibmFtZSI6eyJpbnB1dE5hbWUiOiIiLCJ1aSI6eyJsYWJlbCI6Ik5hbWUifSwiY29uc3QiOnsiY29uc3ROYW1lMSI6ImNvbnN0IHZhbHVlIn0sInZhbGlkYXRvcnMiOlt7ImZhY3RvcnkiOiJudW1lcmljIn1dfSwic3VybmFtZSI6eyJpbnB1dE5hbWUiOiIiLCJ1aSI6eyJsYWJlbCI6IlN1cm5hbWUifSwiY29uc3QiOnsiY29uc3ROYW1lMjplbmMiOiJlbmNyeXB0ZWQgdmFsdWUifSwidmFsaWRhdG9ycyI6W3siZmFjdG9yeSI6Im51bWVyaWMifV19fSwiaG9va3MiOnsicHJlIjpbeyJmYWN0b3J5Ijoid2ViaG9vayIsInBhcmFtcyI6eyJ1cmwiOiJ0ZXN0LmV4YW1wbGUuY29tIiwiaGVhZGVycyI6W10sIm1ldGhvZCI6InBvc3QiLCJ2YWx1ZXMiOnsibmFtZVN1cm5hbWUiOiJ7JC5maWVsZHMubmFtZS52YWx1ZX0geyQuZmllbGRzLnN1cm5hbWUudmFsdWV9In19fV0sInBvc3QiOlt7ImZhY3RvcnkiOiJlbWFpbCIsInBhcmFtcyI6eyJyZWNpcGllbnRzIjpbeyJlbWFpbDplbmMiOiJleGFtcGxlQG1haWwuY29tIn1dfX1dfX19';
