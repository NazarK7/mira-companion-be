// backend/src/cameras/cameras.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@Injectable()
export class CamerasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCameraDto: CreateCameraDto) {
    return this.prisma.camera.create({
      data: createCameraDto,
    });
  }

  async findAll(stationId?: string) {
    const where = stationId ? { stationId } : {};
    return this.prisma.camera.findMany({
      where,
      select: {
        id: true,
        stationId: true,
        name: true,
        type: true,
        cameraModel: true,
        ipAddress: true,
        status: true, // Sbloccato
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id },
      include: {
        jobs: {
          select: {
            id: true,
            name: true,
            visionToolSlot: true, // Sbloccato
            updatedAt: true, 
          },
          orderBy: { updatedAt: 'desc' },
        },
        calibrations: {
          select: {
            id: true,
            mode: true, // Sbloccato
            isCurrent: true, // Sbloccato
            createdAt: true, 
          },
          orderBy: { createdAt: 'desc' }, 
        },
        _count: {
          select: {
            robotBackups: true,
            halconLicenses: true,
            maintenanceEvents: true,
          },
        },
      },
    });

    if (!camera) {
      throw new NotFoundException(`Camera con id ${id} non trovata`);
    }
    return camera;
  }

  async update(id: string, updateCameraDto: UpdateCameraDto) {
    return this.prisma.camera.update({
      where: { id },
      data: updateCameraDto,
    });
  }

  async remove(id: string) {
    return this.prisma.camera.delete({
      where: { id },
    });
  }
}