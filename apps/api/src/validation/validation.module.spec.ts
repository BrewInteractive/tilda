import { Test, TestingModule } from '@nestjs/testing';
import { ValidationModule } from './validation.module';
import { ValidationService } from './validation.service';
import { ValidatorFactory } from './validator-factory';

describe('ValidationModule', () => {
  let validationService: ValidationService;

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

    validationService = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(validationService).toBeDefined();
  });
});
