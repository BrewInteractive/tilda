import { ValidationFactory } from './validation-factory';
import { ValidatorType } from '../models/fields/validator-type.enum';
import {
  Alpha,
  Numeric,
  AlphaNumeric,
  Enum,
  Length,
  NotEmpty,
  Regex,
} from './validation';
import { InvalidArgumentException } from './validation/exceptions';

describe('ValidationFactory', () => {
  let factory: ValidationFactory;

  beforeEach(() => {
    factory = new ValidationFactory();
  });

  it('should return correct validator instances', () => {
    expect(factory.getValidation(ValidatorType.alpha)).toBeInstanceOf(Alpha);
    expect(factory.getValidation(ValidatorType.numeric)).toBeInstanceOf(
      Numeric,
    );
    expect(factory.getValidation(ValidatorType.alphanumeric)).toBeInstanceOf(
      AlphaNumeric,
    );
    expect(factory.getValidation(ValidatorType.enum)).toBeInstanceOf(Enum);
    expect(factory.getValidation(ValidatorType.length)).toBeInstanceOf(Length);
    expect(factory.getValidation(ValidatorType.notEmpty)).toBeInstanceOf(
      NotEmpty,
    );
    expect(factory.getValidation(ValidatorType.regex)).toBeInstanceOf(Regex);
  });
  it('should return undefined for unknown validator types', () => {
    expect(
      factory.getValidation('unknownType' as ValidatorType),
    ).toBeUndefined();
  });

  describe('AlphaValidation', () => {
    it('should return correct data for AlphaValidation', () => {
      const alphaValidator = factory.getValidation(
        ValidatorType.alpha,
      ) as Alpha;
      const expectedData = {
        type: 'string',
        pattern: '^[a-zA-Z]+$',
      };
      const validationResult = alphaValidator.getValidation();
      expect(validationResult).toEqual(expectedData);
    });
  });

  describe('LengthValidation', () => {
    it('should return validation for maxLength LengthValidation', () => {
      const lengthValidator = factory.getValidation(
        ValidatorType.length,
      ) as Length;

      const params = { maxLength: '10' };
      const expectedResult = {
        type: 'string',
        maxLength: 10,
      };
      const validation = lengthValidator.getValidation(params);
      expect(validation).toEqual(expectedResult);
    });
    it('should return validation for minLength and maxLength LengthValidation', () => {
      const lengthValidator = factory.getValidation(
        ValidatorType.length,
      ) as Length;
      const params = { minLength: '3', maxLength: '10' };
      const expectedResult = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      };
      const validation = lengthValidator.getValidation(params);
      expect(validation).toEqual(expectedResult);
    });
    it('should throw InvalidArgumentException if no minLength or maxLength provided for LengthValidation', () => {
      const lengthValidator = factory.getValidation(
        ValidatorType.length,
      ) as Length;
      expect(() => {
        lengthValidator.getValidation({});
      }).toThrow(InvalidArgumentException);
    });
  });

  describe('EnumValidation', () => {
    it('should return validation pattern when params are provided for EnumValidation', () => {
      const regexValidator = factory.getValidation(
        ValidatorType.regex,
      ) as Regex;
      const params = { value: '^\\d+$', onMatch: 'allow' };
      const expectedResult = {
        type: 'string',
        pattern: '^\\d+$',
      };
      const validation = regexValidator.getValidation(params);
      expect(validation).toEqual(expectedResult);
    });
    it('should throw InvalidArgumentException if params are missing for EnumValidation', () => {
      const regexValidator = factory.getValidation(
        ValidatorType.regex,
      ) as Regex;
      expect(() => {
        regexValidator.getValidation({});
      }).toThrow(InvalidArgumentException);
    });
    it('should throw InvalidArgumentException if value or onMatch params are missing for EnumValidation', () => {
      const regexValidator = factory.getValidation(
        ValidatorType.regex,
      ) as Regex;

      expect(() => {
        regexValidator.getValidation({ value: '^\\d+$' });
      }).toThrow(InvalidArgumentException);

      expect(() => {
        regexValidator.getValidation({ onMatch: 'allow' });
      }).toThrow(InvalidArgumentException);
    });
  });
});
