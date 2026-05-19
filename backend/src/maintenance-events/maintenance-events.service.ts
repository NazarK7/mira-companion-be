// backend/src/maintenance-events/maintenance-events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';

@Injectable()
export class MaintenanceEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateMaintenanceEventDto) {
    return this.prisma.maintenanceEvent.create({
      data: {
        ...createDto,
        occurredAt: new Date(createDto.occurredAt),
      },
    });
  }

  async findAll(cameraId?: string) {
    const where = cameraId ? { cameraId } : {};
    return this.prisma.maintenanceEvent.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.maintenanceEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException(`Evento ${id} non trovato`);
    return event;
  }

  async remove(id: string) {
    return this.prisma.maintenanceEvent.delete({ where: { id } });
  }
}