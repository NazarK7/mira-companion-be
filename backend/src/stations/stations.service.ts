// backend/src/stations/stations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createStationDto: CreateStationDto) {
    return this.prisma.station.create({
      data: {
        ...createStationDto,
        installDate: createStationDto.installDate ? new Date(createStationDto.installDate) : undefined,
      }
    });
  }

  async findAll(query: { plantId?: string; search?: string; skip?: number; take?: number }) {
    const { plantId, search, skip, take } = query;
    const where: any = {};

    // Se viene passato plantId, filtriamo per quella pianta
    if (plantId) where.plantId = plantId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.station.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: {
          plant: { include: { customer: true } },
          _count: { select: { cameras: true } }
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.station.count({ where })
    ]);

    return {
      items: items.map(s => ({
        ...s,
        plantName: s.plant.name,
        customerName: s.plant.customer.name,
        customerSlug: s.plant.customer.slug,
        camerasCount: s._count.cameras
      })),
      total
    };
  }

  async findOne(id: string) {
    const station = await this.prisma.station.findUnique({
      where: { id },
      include: {
        // Estrazione dati base delle camere per la UI StationDetail
        cameras: {
          select: {
            id: true,
            name: true,
            type: true,
            cameraModel: true,
            ipAddress: true,
            status: true,
            _count: { select: { jobs: true, halconLicenses: true, maintenanceEvents: true } }
          }
        }
      },
    });
    if (!station) throw new NotFoundException(`Station ${id} non trovata`);
    return station;
  }

  async update(id: string, updateStationDto: UpdateStationDto) {
    return this.prisma.station.update({
      where: { id },
      data: {
        ...updateStationDto,
        installDate: updateStationDto.installDate ? new Date(updateStationDto.installDate) : undefined,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.station.delete({ where: { id } });
  }
}