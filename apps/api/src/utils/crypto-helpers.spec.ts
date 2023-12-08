import { encrypt, decrypt, calculateHmac, verifyHmac } from './crypto-helpers';
describe('Crypto Helpers', () => {
  const text = 'test';
  const secretKey =
    'd01858dd2f86ab1d3a7c4a152e6b3755a9eff744999b3a07c17fb9cbb363154e';
  const dataObject = { message: 'Test' };

  describe('Encrypt and Decrypt', () => {
    it('should encrypt and decrypt the text with valid input', () => {
      const encryptedText = encrypt(text, secretKey);
      expect(encryptedText).toBeDefined();
      expect(typeof encryptedText).toBe('string');
      expect(encryptedText).toContain(':');
      console.log(encryptedText);

      const decryptedText = decrypt(encryptedText, secretKey);

      expect(decryptedText).toBe(text);
    });

    it('should throw an error if text or key is missing for encrypt', () => {
      expect(() => encrypt('', secretKey)).toThrow(
        'Text and key are required.',
      );
      expect(() => encrypt(text, '')).toThrow('Text and key are required.');

      expect(() => encrypt(text, 'd01858dd2f86ab1d3')).toThrow(
        'Key must be 32 bytes in hexadecimal.',
      );
    });

    it('should throw an error if invalid key for encrypt', () => {
      const invalidKey =
        'invalidkey86ab1d3a7c4a152e6b3755a9eff744999b3a07c17fb9cbb363154e';

      expect(() => encrypt(text, invalidKey)).toThrow(
        'Encryption failed: Invalid key length',
      );
    });

    it('should throw an error if text or key is missing for decrypt', () => {
      expect(() => decrypt(text, '')).toThrow(
        'Decryption failed: Invalid initialization vector',
      );
    });
  });
  describe('HMAC', () => {
    it('should calculate HMAC for valid input', () => {
      const calculatedHmac = calculateHmac(dataObject, secretKey);
      expect(calculatedHmac).toBeDefined();
      expect(typeof calculatedHmac).toBe('string');
    });

    it('should verify HMAC for valid input', () => {
      const calculatedHmac = calculateHmac(dataObject, secretKey);
      const isValid = verifyHmac(dataObject, secretKey, calculatedHmac);
      expect(isValid).toBe(true);
    });

    it('should throw an error if data or secret is missing', () => {
      expect(() => calculateHmac(undefined, secretKey)).toThrow(
        'Data and secret are required.',
      );
      expect(() => calculateHmac(dataObject, '')).toThrow(
        'Data and secret are required.',
      );
      expect(() =>
        calculateHmac(dataObject, secretKey, 'invalidAlgorithm'),
      ).toThrow('HMAC calculation failed: Invalid digest: invalidAlgorithm');
    });
    it('should throw an error if invalidHMAC for verifyHmac', () => {
      expect(() => verifyHmac(dataObject, secretKey, 'invalidHmac')).toThrow(
        'HMAC verification failed: Input buffers must have the same byte length',
      );
    });
  });
});
