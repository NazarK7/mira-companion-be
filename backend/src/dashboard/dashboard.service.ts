import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    // Eseguiamo i COUNT in parallelo per la massima performance
    const [customers, plants, stations, cameras] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.plant.count(),
      this.prisma.station.count(),
      this.prisma.camera.count(),
    ]);

    return { customers, plants, stations, cameras };
  }
}