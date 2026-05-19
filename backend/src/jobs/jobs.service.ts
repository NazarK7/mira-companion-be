// backend/src/jobs/jobs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobBackupDto } from './dto/create-job-backup.dto';
import { join } from 'node:path';
import { createReadStream } from 'node:fs';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) { }

  // --- GESTIONE JOB LOGICO ---

  async createJob(createDto: CreateJobDto) {
    return this.prisma.job.create({ data: createDto });
  }

  async findAllJobs(cameraId?: string) {
    const where = cameraId ? { cameraId } : {};
    return this.prisma.job.findMany({
      where,
      include: {
        _count: { select: { backups: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOneJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        backups: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            createdAt: true,
            notes: true,
            createdBy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!job) throw new NotFoundException(`Job ${id} non trovato`);
    return job;
  }

  // --- GESTIONE JOB BACKUP (FILE FISICI) ---

  async addBackup(jobId: string, dto: CreateJobBackupDto, file: Express.Multer.File) {
    // Verifichiamo che il Job esista prima di salvare orfani
    await this.findOneJob(jobId);

    if (!file) throw new NotFoundException('File fisico mancante');

    return this.prisma.jobBackup.create({
      data: {
        jobId,
        notes: dto.notes,
        createdBy: dto.createdBy,
        filePath: file.filename,
        fileName: file.originalname,
        fileSize: BigInt(file.size), // Cast a BigInt nativo per lo schema Prisma
      },
    });
  }

  async getBackup(backupId: string) {
    const backup = await this.prisma.jobBackup.findUnique({
      where: { id: backupId },
    });
    if (!backup) throw new NotFoundException(`Backup ${backupId} non trovato`);
    return backup;
  }

  getBackupFileStream(filename: string) {
    const basePath = join(process.cwd(), 'data', 'blobs');
    const absolutePath = join(basePath, filename);
    return createReadStream(absolutePath);
  }

  async removeBackup(backupId: string) {
    const backup = await this.getBackup(backupId);

    if (backup.filePath) {
      await this.storage.deleteFile(backup.filePath);
    }

    return this.prisma.jobBackup.delete({ where: { id: backupId } });
  }

  async updateJob(id: string, updateDto: UpdateJobDto) {
    // Verifica che il job esista
    await this.findOneJob(id);

    return this.prisma.job.update({
      where: { id },
      data: updateDto,
    });
  }

  async removeJob(id: string) {
    // 1. Recuperiamo il job con tutti i suoi backup per poter cancellare i file fisici
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { backups: true },
    });

    if (!job) throw new NotFoundException(`Job ${id} non trovato`);

    // 2. Eliminiamo i file fisici dei backup associati a questo job
    for (const backup of job.backups) {
      if (backup.filePath) {
        await this.storage.deleteFile(backup.filePath);
      }
    }

    // 3. Eliminiamo il job dal DB (i record in JobBackup verranno eliminati 
    // in automatico se c'è "onDelete: Cascade" nello schema Prisma)
    return this.prisma.job.delete({
      where: { id },
    });
  }
}