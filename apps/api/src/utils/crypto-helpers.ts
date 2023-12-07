import * as crypto from 'crypto';

export const encrypt = (
  text: string,
  key: string,
  algorithm = 'AES-256-GCM',
  IV_LENGTH = 16,
): string => {
  if (!text || !key) {
    throw new Error('Text and key are required.');
  }

  if (key.length !== 64) {
    throw new Error('Key must be 32 bytes in hexadecimal.');
  }

  try {
    const initializationVector = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(key, 'hex'),
      initializationVector,
    );

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${initializationVector.toString('hex')}:${encrypted.toString(
      'hex',
    )}`;
  } catch (error) {
    throw new Error('Encryption failed.');
  }
};

export const decrypt = (
  text: string,
  key: string,
  algorithm = 'AES-256-GCM',
): string => {
  try {
    const [iv, encryptedText] = text
      .split(':')
      .map((part) => Buffer.from(part, 'hex'));
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, 'hex'),
      iv,
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    throw new Error('Decryption failed.');
  }
};

export const calculateHmac = (
  data: object,
  secret: string,
  algorithm = 'SHA256',
): string => {
  if (!data || !secret) {
    throw new Error('Data and secret are required.');
  }
  try {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  } catch (error) {
    throw new Error('HMAC calculation failed.');
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
    throw new Error('HMAC verification failed.');
  }
};
