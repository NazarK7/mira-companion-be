// backend/src/cameras/cameras.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@Injectable()
export class CamerasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(createCameraDto: CreateCameraDto) {
    // Controllo preventivo unicità nome in stazione
    const existing = await this.prisma.camera.findFirst({
      where: { 
        stationId: createCameraDto.stationId, 
        name: createCameraDto.name 
      },
    });

    if (existing) {
      throw new ConflictException(`Esiste già una camera chiamata "${createCameraDto.name}" in questa stazione.`);
    }

    return this.prisma.camera.create({
      data: createCameraDto,
    });
  }

  async findAll(query: { stationId?: string; search?: string; skip?: number; take?: number }) {
    const { stationId, search, skip, take } = query;
    const where: any = {};
    if (stationId) where.stationId = stationId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { cameraModel: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.camera.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: {
          station: { include: { plant: { include: { customer: true } } } },
          _count: { select: { jobs: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.camera.count({ where }),
    ]);

    return {
      items: items.map((cam: any) => ({
        id: cam.id,
        name: cam.name,
        type: cam.type,
        cameraModel: cam.cameraModel,
        ipAddress: cam.ipAddress,
        status: cam.status,
        customerSlug: cam.station.plant.customer.slug,
        customerName: cam.station.plant.customer.name,
        plantId: cam.station.plant.id,
        plantName: cam.station.plant.name,
        stationId: cam.stationId,
        stationName: cam.station.name,
        jobsCount: cam._count.jobs,
        // Asset MiRa3D (Uso any per bypassare lag di tipo del compilatore)
        mira3dBackupName: cam.mira3dBackupName,
        halconLicenseName: cam.halconLicenseName,
        restartOnCrashName: cam.restartOnCrashName,
      })),
      total,
    };
  }

  async findOne(id: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id },
      include: {
        jobs: { orderBy: { updatedAt: 'desc' } },
        calibrations: { orderBy: { createdAt: 'desc' } },
        _count: {
          select: {
            robotBackups: true,
            maintenanceEvents: true,
          },
        },
      },
    });
    if (!camera) throw new NotFoundException(`Camera ${id} non trovata`);
    return camera as any; // Cast per permettere l'accesso ai nuovi campi asset
  }

  async updateAsset(id: string, type: 'mira3d' | 'halcon' | 'restart', file: Express.Multer.File) {
    const camera = await this.findOne(id);
    const updateData: any = {};

    if (type === 'mira3d') {
      if (camera.mira3dBackupPath) await this.storage.deleteFile(camera.mira3dBackupPath);
      updateData.mira3dBackupPath = file.filename;
      updateData.mira3dBackupName = file.originalname;
      updateData.mira3dBackupSize = BigInt(file.size);
    } else if (type === 'halcon') {
      if (camera.halconLicensePath) await this.storage.deleteFile(camera.halconLicensePath);
      updateData.halconLicensePath = file.filename;
      updateData.halconLicenseName = file.originalname;
      updateData.halconLicenseSize = BigInt(file.size);
    } else if (type === 'restart') {
      if (camera.restartOnCrashPath) await this.storage.deleteFile(camera.restartOnCrashPath);
      updateData.restartOnCrashPath = file.filename;
      updateData.restartOnCrashName = file.originalname;
      updateData.restartOnCrashSize = BigInt(file.size);
    }

    return this.prisma.camera.update({
      where: { id },
      data: updateData,
    });
  }

  async update(id: string, updateCameraDto: UpdateCameraDto) {
    return this.prisma.camera.update({ where: { id }, data: updateCameraDto });
  }

  async remove(id: string) {
    const camera = await this.findOne(id);
    if (camera.mira3dBackupPath) await this.storage.deleteFile(camera.mira3dBackupPath);
    if (camera.halconLicensePath) await this.storage.deleteFile(camera.halconLicensePath);
    if (camera.restartOnCrashPath) await this.storage.deleteFile(camera.restartOnCrashPath);
    return this.prisma.camera.delete({ where: { id } });
  }
}