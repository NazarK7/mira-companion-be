// backend/src/robot-backups/robot-backups.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateRobotBackupDto } from './dto/create-robot-backup.dto';
import { join } from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class RobotBackupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(createDto: CreateRobotBackupDto, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('Nessun file fisico rilevato per il backup');
    }

    return this.prisma.robotBackupRecord.create({
      data: {
        cameraId: createDto.cameraId,
        notes: createDto.notes,
        filePath: file.filename,          // L'UUID generato da Multer
        fileName: file.originalname,      // Il nome originale per la UX di scaricamento
        fileSize: BigInt(file.size),      // Cast esplicito a BigInt per Prisma
      },
    });
  }

  async findAll(cameraId?: string) {
    const where = cameraId ? { cameraId } : {};
    return this.prisma.robotBackupRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const backup = await this.prisma.robotBackupRecord.findUnique({
      where: { id },
    });
    if (!backup) throw new NotFoundException(`Backup ${id} non trovato`);
    return backup;
  }

  async remove(id: string) {
    const backup = await this.findOne(id);

    // 1. Purge dal filesystem fisico
    await this.storage.deleteFile(backup.filePath);

    // 2. Rimozione da database
    return this.prisma.robotBackupRecord.delete({
      where: { id },
    });
  }

  getFileStream(filename: string) {
    const basePath = join(process.cwd(), 'data', 'blobs');
    const absolutePath = join(basePath, filename);
    return createReadStream(absolutePath);
  }
}