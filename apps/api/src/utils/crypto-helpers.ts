import * as crypto from 'crypto';
import {
  EncryptionError,
  DecryptionError,
  HmacError,
} from './errors/crypto-helpers.error';

export const encrypt = (
  text: string,
  key: string,
  algorithm = 'AES-256-GCM' as crypto.CipherGCMTypes,
  IV_LENGTH = 12,
  authTagLength = 16,
): string => {
  if (!text || !key) {
    throw new EncryptionError(`Text and key are required.`);
  }

  if (key.length !== 64) {
    throw new EncryptionError(`Key must be 32 bytes in hexadecimal.`);
  }

  try {
    const initializationVector = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(key, 'hex'),
      initializationVector,
      { authTagLength },
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authenticationTag = cipher.getAuthTag();

    return `${initializationVector.toString(
      'hex',
    )}:${encrypted}:${authenticationTag.toString('hex')}`;
  } catch (error) {
    throw new EncryptionError(`Encryption failed: ${error.message}`);
  }
};

export const decrypt = (
  text: string,
  key: string,
  algorithm = 'AES-256-GCM' as crypto.CipherGCMTypes,
  authTagLength = 16,
): string => {
  try {
    const [iv, encryptedText, authTag] = text
      .split(':')
      .map((part) => Buffer.from(part, 'hex'));

    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, 'hex'),
      iv,
      { authTagLength },
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new DecryptionError(`Decryption failed: ${error.message}`);
  }
};

export const calculateHmac = (
  data: object,
  secret: string,
  algorithm = 'SHA256',
): string => {
  if (!data || !secret) {
    throw new HmacError(`Data and secret are required.`);
  }
  try {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  } catch (error) {
    throw new HmacError(`HMAC calculation failed: ${error.message}`);
  }
};

export const verifyHmac = (
  data: object,
  secret: string,
  receivedHMAC: string,
  algorithm = 'SHA256',
): boolean => {
  try {
    const calculatedHMAC = calculateHmac(data, secret, algorithm);
    const isEqual = crypto.timingSafeEqual(
      Buffer.from(calculatedHMAC, 'hex'),
      Buffer.from(receivedHMAC, 'hex'),
    );
    return isEqual;
  } catch (error) {
    throw new HmacError(`HMAC verification failed: ${error.message}`);
  }
};
