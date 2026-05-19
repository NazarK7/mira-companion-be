// backend/src/halcon-licenses/halcon-licenses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateHalconLicenseDto } from './dto/create-halcon-license.dto';
import { join } from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class HalconLicensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(createDto: CreateHalconLicenseDto, file: Express.Multer.File) {
    if (!file) throw new NotFoundException('File di licenza mancante');

    return this.prisma.halconLicenseRecord.create({
      data: {
        cameraId: createDto.cameraId,
        version: createDto.version,
        expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
        notes: createDto.notes,
        filePath: file.filename,
        fileName: file.originalname,
        fileSize: BigInt(file.size),
      },
    });
  }

  async findAll(cameraId?: string) {
    const where = cameraId ? { cameraId } : {};
    return this.prisma.halconLicenseRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const license = await this.prisma.halconLicenseRecord.findUnique({ where: { id } });
    if (!license) throw new NotFoundException(`Licenza ${id} non trovata`);
    return license;
  }

  async remove(id: string) {
    const license = await this.findOne(id);
    if (license.filePath) {
      await this.storage.deleteFile(license.filePath);
    }
    return this.prisma.halconLicenseRecord.delete({ where: { id } });
  }

  getFileStream(filename: string) {
    const basePath = join(process.cwd(), 'data', 'blobs');
    return createReadStream(join(basePath, filename));
  }
}