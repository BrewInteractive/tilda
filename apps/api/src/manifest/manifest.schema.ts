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
                        enum: ['post', 'get'],
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
                    enum: ['email'],
                  },
                  params: {
                    type: 'object',
                    properties: {
                      recipients: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            'email:enc': {
                              type: 'string',
                            },
                          },
                          required: ['email:enc'],
                        },
                      },
                    },
                    required: ['recipients'],
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
};

export default TildaManifestSchema;
