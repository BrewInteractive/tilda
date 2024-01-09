import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { manifest } from './fixtures/manifest-schema-test';
import { faker } from '@faker-js/faker';

const mockValidatorFactory = {
  getValidator: jest.fn(() => {
    return {
      getValidator: jest.fn(() => {
        return {
          type: 'string',
          pattern: '^[a-zA-Z]+$',
        };
      }),
    };
  }),
};

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidationService,
        { provide: 'ValidatorFactory', useValue: mockValidatorFactory },
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

    const result = validationService.validate(data, manifest.data);
    expect(result.success).toBe(true);
  });

  it('should validate a single field with invalid data unsuccessfully', () => {
    const data = {
      name: faker.number.int(10),
    };

    const result = validationService.validate(data, manifest.data);
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe('must be string');
  });

  it('should validate all fields with valid data successfully', () => {
    const data = {
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
    };

    const result = validationService.validate(data, manifest.data);
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should validate all fields with invalid data unsuccessfully', () => {
    const data = {
      name: faker.number.int(10),
      surname: faker.number.int(10),
    };

    const result = validationService.validate(data, manifest.data);
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
