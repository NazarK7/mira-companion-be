// backend/src/storage/storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly basePath = path.join(process.cwd(), 'data', 'blobs');

  /**
   * Elimina fisicamente un file dal disco.
   * Da invocare prima di eliminare il record corrispondente in Prisma.
   */
  async deleteFile(relativePath: string | null | undefined): Promise<void> {
    if (!relativePath) return;

    const absolutePath = path.join(this.basePath, relativePath);
    try {
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        this.logger.log(`Deleted blob: ${absolutePath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete blob: ${absolutePath}`, error);
    }
  }

  /**
   * Restituisce la dimensione in bytes di un file fisico.
   */
  async getFileSize(relativePath: string): Promise<number> {
    const absolutePath = path.join(this.basePath, relativePath);
    try {
      const stats = await fs.promises.stat(absolutePath);
      return stats.size;
    } catch (error) {
      this.logger.error(`Failed to get file size for: ${absolutePath}`, error);
      throw error;
    }
  }
}