import { Constants } from '../models';

const TildaManifestSchema = {
  type: 'object',
  properties: {
    hmac: {
      type: 'string',
    },
    data: {
      type: 'object',
      properties: {
        fields: {
          type: 'object',
          minProperties: 1,
          patternProperties: {
            '^.*$': {
              type: 'object',
              properties: {
                inputName: {
                  type: 'string',
                },
                ui: {
                  type: 'object',
                  properties: {
                    label: {
                      type: 'string',
                    },
                  },
                },
                const: {
                  type: 'object',
                  patternProperties: {
                    '^.*$': {
                      type: 'string',
                    },
                  },
                },
                validators: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      factory: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        hooks: {
          type: 'object',
          properties: {
            pre: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  factory: {
                    type: 'string',
                    enum: ['webhook'],
                  },
                  params: {
                    type: 'object',
                    properties: {
                      url: {
                        type: 'string',
                        minLength: 1,
                      },
                      method: {
                        type: 'string',
                        enum: ['post', 'get', 'POST', 'GET'],
                      },
                      headers: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                        nullable: true,
                      },
                      values: {
                        type: 'object',
                        nullable: true,
                        additionalProperties: {
                          type: 'string',
                        },
                      },
                    },
                    required: ['url', 'method'],
                  },
                },
                required: ['factory', 'params'],
              },
            },
            post: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  factory: {
                    type: 'string',
                    enum: ['email', 'webhook'],
                  },
                  params: {
                    type: 'object',
                    properties: {
                      recipients: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            [Constants.emailSuffix]: {
                              type: 'string',
                              pattern:
                                '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                            },
                          },
                          required: [Constants.emailSuffix],
                        },
                      },
                      url: {
                        type: 'string',
                        minLength: 1,
                      },
                      method: {
                        type: 'string',
                        enum: ['post', 'get', 'POST', 'GET'],
                      },
                      headers: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                        nullable: true,
                      },
                      values: {
                        type: 'object',
                        nullable: true,
                        additionalProperties: {
                          type: 'string',
                        },
                      },
                    },
                    required: [],
                  },
                },
                if: {
                  properties: { factory: { const: 'email' } },
                },
                then: {
                  properties: {
                    params: {
                      required: ['recipients'],
                    },
                  },
                },
                else: {
                  properties: {
                    params: {
                      required: ['url', 'method'],
                    },
                  },
                },
                required: ['factory', 'params'],
              },
            },
          },
        },
      },
      required: ['fields', 'hooks'],
    },
  },
  required: ['data'],
};

export default TildaManifestSchema;
