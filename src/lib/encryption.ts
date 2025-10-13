import crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.FILE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = 'aes-256-cbc';

export class FileEncryption {
  /**
   * Encrypts file buffer data
   */
  static encrypt(buffer: Buffer): { encryptedData: Buffer; iv: Buffer } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
      encryptedData: encrypted,
      iv
    };
  }

  /**
   * Decrypts file buffer data
   */
  static decrypt(encryptedData: Buffer, iv: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);

    return decrypted;
  }

  /**
   * Generates a secure hash for file integrity checking
   */
  static generateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Verifies file integrity using hash
   */
  static verifyHash(buffer: Buffer, expectedHash: string): boolean {
    const actualHash = this.generateHash(buffer);
    return actualHash === expectedHash;
  }

  /**
   * Encrypts sensitive text data (like credentials)
   */
  static encryptText(text: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypts sensitive text data
   */
  static decryptText(encryptedText: string, ivHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
