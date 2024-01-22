import { Test, TestingModule } from '@nestjs/testing';
import { ValidationModule } from './validation.module';
import { ValidatorFactory } from './validator-factory';

describe('ValidationModule', () => {
  let validationModule: ValidationModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ValidationModule],
      providers: [
        {
          provide: 'ValidatorFactory',
          useValue: ValidatorFactory,
        },
      ],
    }).compile();

    validationModule = module.get<ValidationModule>(ValidationModule);
  });

  it('should be defined', () => {
    expect(ValidationModule).toBeDefined();
  });
});
