// backend/src/plants/plants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlantDto: CreatePlantDto) {
    const { contacts, ...data } = createPlantDto;
    return this.prisma.plant.create({
      data: {
        ...data,
        contacts: contacts ? { create: contacts } : undefined,
      }
    });
  }

async findAll(query: { search?: string; skip?: number; take?: number }) {
  const { search, skip, take } = query;
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    this.prisma.plant.findMany({
      where,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      include: { customer: true, _count: { select: { stations: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    this.prisma.plant.count({ where })
  ]);

  return {
    items: items.map(p => ({
      ...p,
      customerName: p.customer.name,
      customerSlug: p.customer.slug,
      stationsCount: p._count.stations
    })),
    total
  };
}

  async findOne(id: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: {
        contacts: true, // Importante: carica i contatti per la view di Edit
        _count: { select: { stations: true } },
        stations: {
          select: { id: true, name: true, code: true, status: true }
        }
      },
    });
    if (!plant) throw new NotFoundException(`Plant with ID ${id} not found`);
    return plant;
  }

  async update(id: string, updatePlantDto: UpdatePlantDto) {
    const { contacts, ...data } = updatePlantDto;
    return this.prisma.plant.update({
      where: { id },
      data: {
        ...data,
        // Wipe & Replace: elimina i vecchi contatti e crea i nuovi passati dal form
        contacts: contacts ? {
          deleteMany: {},
          create: contacts
        } : undefined,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.plant.delete({ where: { id } });
  }
}