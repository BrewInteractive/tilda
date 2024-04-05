import { ValidatorFactory } from './validator-factory';
import { ValidatorType } from '../models';
import {
  Alpha,
  Numeric,
  AlphaNumeric,
  Enum,
  Length,
  NotEmpty,
  Regex,
} from './validators';
import { InvalidArgumentException } from './validators/exceptions';

describe('ValidatorFactory', () => {
  let factory: ValidatorFactory;

  beforeEach(() => {
    factory = new ValidatorFactory();
  });

  it('should return correct validator instances', () => {
    expect(factory.getValidator(ValidatorType.alpha)).toBeInstanceOf(Alpha);
    expect(factory.getValidator(ValidatorType.numeric)).toBeInstanceOf(Numeric);
    expect(factory.getValidator(ValidatorType.alphanumeric)).toBeInstanceOf(
      AlphaNumeric,
    );
    expect(factory.getValidator(ValidatorType.enum)).toBeInstanceOf(Enum);
    expect(factory.getValidator(ValidatorType.length)).toBeInstanceOf(Length);
    expect(factory.getValidator(ValidatorType.notEmpty)).toBeInstanceOf(
      NotEmpty,
    );
    expect(factory.getValidator(ValidatorType.regex)).toBeInstanceOf(Regex);
  });
  it('should return undefined for unknown validator types', () => {
    expect(
      factory.getValidator('unknownType' as ValidatorType),
    ).toBeUndefined();
  });

  describe('AlphaValidator', () => {
    it('should return correct data for AlphaValidator', () => {
      const alphaValidator = factory.getValidator(ValidatorType.alpha) as Alpha;
      const expectedData = {
        type: 'string',
        pattern: '^[a-zA-Z\\sçÇğĞıİöÖşŞüÜ]+$',
      };
      const validator = alphaValidator.getValidator();
      expect(validator).toEqual(expectedData);
    });
  });

  describe('LengthValidator', () => {
    it('should return validator for maxLength LengthValidator', () => {
      const lengthValidator = factory.getValidator(
        ValidatorType.length,
      ) as Length;

      const params = { maxLength: '10' };
      const expectedResult = {
        type: 'string',
        maxLength: 10,
      };
      const validator = lengthValidator.getValidator(params);
      expect(validator).toEqual(expectedResult);
    });
    it('should return validator for minLength and maxLength LengthValidator', () => {
      const lengthValidator = factory.getValidator(
        ValidatorType.length,
      ) as Length;
      const params = { minLength: '3', maxLength: '10' };
      const expectedResult = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      };
      const validator = lengthValidator.getValidator(params);
      expect(validator).toEqual(expectedResult);
    });
    it('should throw InvalidArgumentException if no minLength or maxLength provided for LengthValidator', () => {
      const lengthValidator = factory.getValidator(
        ValidatorType.length,
      ) as Length;
      expect(() => {
        lengthValidator.getValidator({});
      }).toThrow(InvalidArgumentException);
    });
  });

  describe('EnumValidator', () => {
    it('should return validator pattern when params are provided for EnumValidator', () => {
      const regexValidator = factory.getValidator(ValidatorType.regex) as Regex;
      const params = { value: '^\\d+$', onMatch: 'allow' };
      const expectedResult = {
        type: 'string',
        pattern: '^\\d+$',
      };
      const validator = regexValidator.getValidator(params);
      expect(validator).toEqual(expectedResult);
    });
    it('should throw InvalidArgumentException if params are missing for EnumValidator', () => {
      const regexValidator = factory.getValidator(ValidatorType.regex) as Regex;
      expect(() => {
        regexValidator.getValidator({});
      }).toThrow(InvalidArgumentException);
    });
    it('should throw InvalidArgumentException if value or onMatch params are missing for EnumValidator', () => {
      const regexValidator = factory.getValidator(ValidatorType.regex) as Regex;

      expect(() => {
        regexValidator.getValidator({ value: '^\\d+$' });
      }).toThrow(InvalidArgumentException);

      expect(() => {
        regexValidator.getValidator({ onMatch: 'allow' });
      }).toThrow(InvalidArgumentException);
    });
  });
});
