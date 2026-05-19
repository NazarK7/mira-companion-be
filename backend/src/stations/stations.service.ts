// backend/src/stations/stations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStationDto: CreateStationDto) {
    return this.prisma.station.create({
      data: {
        ...createStationDto,
        installDate: createStationDto.installDate ? new Date(createStationDto.installDate) : undefined,
      }
    });
  }

  async findAll(plantId?: string) {
    const where = plantId ? { plantId } : {};
    return this.prisma.station.findMany({
      where,
      include: { _count: { select: { cameras: true } } },
      orderBy: { name: 'asc' },
    });
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