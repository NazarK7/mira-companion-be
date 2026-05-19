// backend/src/cameras/cameras.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@Injectable()
export class CamerasService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createCameraDto: CreateCameraDto) {
    return this.prisma.camera.create({
      data: createCameraDto,
    });
  }

  async findAll(query: { stationId?: string; search?: string; skip?: number; take?: number }) {
    const { stationId, search, skip, take } = query;

    // Costruiamo il filtro di ricerca dinamico
    const where: any = {};
    if (stationId) where.stationId = stationId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { cameraModel: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Eseguiamo la query con paginazione e ordinamento per aggiornamento
    const [items, total] = await Promise.all([
      this.prisma.camera.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: {
          station: {
            include: {
              plant: { include: { customer: true } }
            }
          },
          _count: { select: { jobs: true } }
        },
        orderBy: { updatedAt: 'desc' }, // Sempre le più recenti per prime
      }),
      this.prisma.camera.count({ where }) // Ci serve il totale per il paginator del front-end
    ]);

    // Appiattiamo i dati per il front-end (REST Piatto)
    const flattened = items.map(cam => ({
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
      jobsCount: cam._count.jobs
    }));

    return { items: flattened, total };
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