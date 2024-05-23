import { Test, TestingModule } from '@nestjs/testing';

import Ajv from 'ajv';
import { MockFactory } from 'mockingbird';
import { TildaManifestFixture } from '../../test/fixtures/manifest/tilda-manifest.fixture';
import { ValidationService } from './validation.service';
import { ValidatorType } from '../models/fields';
import { faker } from '@faker-js/faker';

const mockValidatorFactory = {
  getValidator: jest.fn((validatorType) => {
    switch (validatorType) {
      case 'alpha':
        return {
          getValidator: jest.fn(() => ({
            type: 'string',
            pattern: '^[a-zA-Z\\sçÇğĞıİöÖşŞüÜ]*$',
          })),
        };
      case 'regex':
        return {
          getValidator: jest.fn(() => ({
            type: 'string',
            pattern: '^.{3,10}$',
          })),
        };
      default:
        return null;
    }
  }),
};

describe('ValidationService', () => {
  let validationService: ValidationService;
  const validManifest = MockFactory(TildaManifestFixture).one();
  const oneMoreValidatorsManifest = MockFactory(TildaManifestFixture).one();
  oneMoreValidatorsManifest.data.fields['name'].validators = [
    {
      factory: ValidatorType.alpha,
    },
    {
      factory: ValidatorType.regex,
      params: {
        value: '^[a-zA-Z\\s]+$',
      },
    },
  ];
  oneMoreValidatorsManifest.data.fields['surname'].validators = [
    {
      factory: ValidatorType.alpha,
    },
    {
      factory: ValidatorType.regex,
      params: {
        value: '^[a-zA-Z\\s]+$',
      },
    },
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidationService,
        { provide: 'ValidatorFactory', useValue: mockValidatorFactory },
        { provide: 'Ajv', useValue: new Ajv({ allErrors: true }) },
      ],
    }).compile();

    validationService = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(validationService).toBeDefined();
  });

  it('should validate a single field with valid data successfully', () => {
    const data = {
      name: faker.string.alpha(10),
    };

    const result = validationService.validate(data, validManifest.data);
    expect(result.success).toBe(true);
  });

  it('should validate a single field with turkish valid data successfully', () => {
    const data = {
      name: 'çÇğĞıİöÖşŞüÜ',
    };

    const result = validationService.validate(data, validManifest.data);
    expect(result.success).toBe(true);
  });

  it('should validate a single field with invalid data unsuccessfully', () => {
    const data = {
      name: faker.number.int(10),
    };

    const result = validationService.validate(data, validManifest.data);
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe('must be string');
  });

  it('should validate all fields with valid data successfully', () => {
    const data = {
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
    };

    const result = validationService.validate(data, validManifest.data);
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should validate all fields with invalid data unsuccessfully', () => {
    const data = {
      name: faker.number.int(10),
      surname: faker.number.int(10),
    };

    const result = validationService.validate(data, validManifest.data);
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
  it('should validate a single field with 2 validators valid data successfully', () => {
    const data = {
      name: faker.string.alpha(3),
      surname: faker.string.alpha(9),
    };

    const result = validationService.validate(
      data,
      oneMoreValidatorsManifest.data,
    );
    expect(result.success).toBe(true);
  });
  it('should validate a single field with 2 validators invalid data unsuccessfully', () => {
    const data = {
      name: faker.string.alpha(1),
      surname: faker.string.alpha(1),
    };

    const result = validationService.validate(
      data,
      oneMoreValidatorsManifest.data,
    );
    expect(result.success).toBe(false);
  });
});
