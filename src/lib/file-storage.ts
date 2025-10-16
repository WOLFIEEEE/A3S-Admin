import fs from 'fs/promises';
import path from 'path';
import { FileEncryption } from './encryption';
import { ClientFileCategory } from '@/types';

export class FileStorageService {
  private static readonly UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Initialize storage directories
   */
  static async initializeStorage(): Promise<void> {
    const categories: ClientFileCategory[] = [
      'contract',
      'credential',
      'asset',
      'document'
    ];

    for (const category of categories) {
      const categoryPath = path.join(this.UPLOAD_DIR, category);
      await fs.mkdir(categoryPath, { recursive: true });
    }
  }

  /**
   * Store file with optional encryption
   */
  static async storeFile(
    file: Buffer,
    filename: string,
    category: ClientFileCategory,
    clientId: string,
    shouldEncrypt: boolean = false
  ): Promise<{ filePath: string; hash: string; isEncrypted: boolean }> {
    await this.initializeStorage();

    // Validate file size
    if (file.length > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    const sanitizedFilename = this.sanitizeFilename(filename);
    const uniqueFilename = `${clientId}_${Date.now()}_${sanitizedFilename}`;
    const filePath = path.join(this.UPLOAD_DIR, category, uniqueFilename);

    let dataToStore = file;
    let isEncrypted = false;

    // Encrypt sensitive files
    if (shouldEncrypt || category === 'credential') {
      const { encryptedData, iv } = FileEncryption.encrypt(file);
      // Store IV alongside encrypted data
      dataToStore = Buffer.concat([iv, encryptedData]);
      isEncrypted = true;
    }

    await fs.writeFile(filePath, dataToStore);
    const hash = FileEncryption.generateHash(file);

    return {
      filePath: filePath.replace(this.UPLOAD_DIR, ''), // Store relative path
      hash,
      isEncrypted
    };
  }

  /**
   * Retrieve file with automatic decryption
   */
  static async retrieveFile(
    filePath: string,
    isEncrypted: boolean = false
  ): Promise<Buffer> {
    const fullPath = path.join(this.UPLOAD_DIR, filePath);

    try {
      const fileData = await fs.readFile(fullPath);

      if (isEncrypted) {
        // Extract IV and encrypted data
        const iv = fileData.subarray(0, 16);
        const encryptedData = fileData.subarray(16);
        return FileEncryption.decrypt(encryptedData, iv);
      }

      return fileData;
    } catch (error) {
      throw new Error(
        `Failed to retrieve file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.UPLOAD_DIR, filePath);

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // File might not exist, which is okay for deletion
    }
  }

  /**
   * Get file info without reading content
   */
  static async getFileInfo(
    filePath: string
  ): Promise<{ size: number; modifiedAt: Date }> {
    const fullPath = path.join(this.UPLOAD_DIR, filePath);

    try {
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      throw new Error(
        `Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sanitize filename to prevent directory traversal
   */
  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.+/g, '.')
      .substring(0, 255);
  }

  /**
   * Validate file type based on category
   */
  static validateFileType(
    filename: string,
    category: ClientFileCategory
  ): boolean {
    const ext = path.extname(filename).toLowerCase();

    const allowedTypes: Record<ClientFileCategory, string[]> = {
      contract: ['.pdf', '.doc', '.docx', '.txt'],
      credential: ['.json', '.txt', '.key', '.pem', '.crt'],
      asset: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.pdf', '.zip'],
      document: ['.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.csv']
    };

    return allowedTypes[category].includes(ext);
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    categoryStats: Record<ClientFileCategory, { files: number; size: number }>;
  }> {
    await this.initializeStorage();

    const categories: ClientFileCategory[] = [
      'contract',
      'credential',
      'asset',
      'document'
    ];
    const categoryStats: Record<
      ClientFileCategory,
      { files: number; size: number }
    > = {
      contract: { files: 0, size: 0 },
      credential: { files: 0, size: 0 },
      asset: { files: 0, size: 0 },
      document: { files: 0, size: 0 }
    };

    let totalFiles = 0;
    let totalSize = 0;

    for (const category of categories) {
      const categoryPath = path.join(this.UPLOAD_DIR, category);

      try {
        const files = await fs.readdir(categoryPath);
        categoryStats[category].files = files.length;

        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          const stats = await fs.stat(filePath);
          categoryStats[category].size += stats.size;
        }

        totalFiles += categoryStats[category].files;
        totalSize += categoryStats[category].size;
      } catch (error) {
        // Category directory might not exist yet
      }
    }

    return {
      totalFiles,
      totalSize,
      categoryStats
    };
  }
}
