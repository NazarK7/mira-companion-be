import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobBackupDto } from './dto/create-job-backup.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async createJob(createDto: CreateJobDto) {
    if (createDto.visionToolSlot) {
      const existingSlot = await this.prisma.job.findFirst({
        where: { cameraId: createDto.cameraId, visionToolSlot: createDto.visionToolSlot }
      });
      if (existingSlot) {
        throw new ConflictException(`Lo Slot VT${createDto.visionToolSlot} è già occupato dal Job: "${existingSlot.name}"`);
      }
    }

    const existingName = await this.prisma.job.findFirst({
      where: { cameraId: createDto.cameraId, name: createDto.name }
    });
    if (existingName) {
      throw new ConflictException(`Esiste già un Job con il nome "${createDto.name}" per questa camera`);
    }

    return this.prisma.job.create({ data: createDto });
  }

  async findAllJobs(cameraId?: string) {
    const where = cameraId ? { cameraId } : {};
    return this.prisma.job.findMany({
      where,
      include: {
        _count: { select: { backups: true, testImages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOneJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        backups: {
          select: { id: true, fileName: true, fileSize: true, createdAt: true, notes: true, createdBy: true },
          orderBy: { createdAt: 'desc' },
        },
        testImages: {
          select: { id: true, fileName: true, fileSize: true, createdAt: true, notes: true },
          orderBy: { createdAt: 'desc' },
        }
      },
    });
    if (!job) throw new NotFoundException(`Job ${id} non trovato`);
    return job;
  }

  // --- GESTIONE JOB BACKUP (LOGICA) ---

  async addBackup(jobId: string, dto: CreateJobBackupDto, file: Express.Multer.File) {
    await this.findOneJob(jobId);
    if (!file) throw new NotFoundException('File fisico mancante');

    return this.prisma.jobBackup.create({
      data: {
        jobId, 
        notes: dto.notes, 
        createdBy: dto.createdBy, 
        filePath: file.filename, 
        fileName: file.originalname, 
        fileSize: BigInt(file.size),
      },
    });
  }

  async getBackup(backupId: string) {
    const backup = await this.prisma.jobBackup.findUnique({ where: { id: backupId } });
    if (!backup) throw new NotFoundException(`Backup ${backupId} non trovato`);
    return backup;
  }

  async removeBackup(backupId: string) {
    const backup = await this.getBackup(backupId);
    if (backup.filePath) {
      await this.storage.deleteFile(backup.filePath);
    }
    return this.prisma.jobBackup.delete({ where: { id: backupId } });
  }

  // --- GESTIONE DATASET IMMAGINI ---

  async addTestImageArchive(jobId: string, notes: string | undefined, file: Express.Multer.File) {
    await this.findOneJob(jobId);
    if (!file) throw new NotFoundException('File fisico mancante');

    return this.prisma.jobTestImage.create({
      data: {
        jobId, 
        notes, 
        filePath: file.filename, 
        fileName: file.originalname, 
        fileSize: BigInt(file.size),
      },
    });
  }

  async getTestImageArchive(imageId: string) {
    const image = await this.prisma.jobTestImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException(`Dataset Immagini ${imageId} non trovato`);
    return image;
  }

  async removeTestImageArchive(imageId: string) {
    const image = await this.getTestImageArchive(imageId);
    if (image.filePath) {
      await this.storage.deleteFile(image.filePath);
    }
    return this.prisma.jobTestImage.delete({ where: { id: imageId } });
  }

  // --- UTILITA' CONDIVISA ---

  async updateJob(id: string, updateDto: UpdateJobDto) {
    await this.findOneJob(id);
    return this.prisma.job.update({ where: { id }, data: updateDto });
  }

  async removeJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { backups: true, testImages: true },
    });

    if (!job) throw new NotFoundException(`Job ${id} non trovato`);

    for (const backup of job.backups) {
      if (backup.filePath) await this.storage.deleteFile(backup.filePath);
    }
    
    for (const image of job.testImages) {
      if (image.filePath) await this.storage.deleteFile(image.filePath);
    }

    return this.prisma.job.delete({ where: { id } });
  }
}