// backend/src/calibrations/calibrations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalibrationDto } from './dto/create-calibration.dto';
import { UpdateCalibrationDto } from './dto/update-calibration.dto';

@Injectable()
export class CalibrationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper per garantire l'unicità della calibrazione "corrente" per camera.
   */
  private async ensureSingleCurrentCalibration(cameraId: string) {
    await this.prisma.calibration.updateMany({
      where: { cameraId, isCurrent: true },
      data: { isCurrent: false },
    });
  }

  async create(createDto: CreateCalibrationDto) {
    // Se la nuova calibrazione è marcata come corrente, resetto le altre
    if (createDto.isCurrent) {
      await this.ensureSingleCurrentCalibration(createDto.cameraId);
    }

    return this.prisma.calibration.create({
      data: {
        cameraId: createDto.cameraId,
        mode: createDto.mode,
        totalPosesPlanned: createDto.totalPosesPlanned,
        // I cast forzano TypeScript a far digerire i JSON a Prisma via l'adapter
        anchorPose: createDto.anchorPose as any,
        poses: createDto.poses as any,
        plate: createDto.plate as any,
        result: createDto.result as any,
        isCurrent: createDto.isCurrent ?? false,
        notes: createDto.notes,
      },
    });
  }

  async findAll(cameraId?: string) {
    const where = cameraId ? { cameraId } : {};
    return this.prisma.calibration.findMany({
      where,
      // Partial Select: Escludiamo i payload JSONB pesanti (poses, result, etc.)
      select: {
        id: true,
        cameraId: true,
        mode: true,
        totalPosesPlanned: true,
        isCurrent: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const calibration = await this.prisma.calibration.findUnique({
      where: { id },
    });
    
    if (!calibration) {
      throw new NotFoundException(`Calibrazione ${id} non trovata`);
    }
    return calibration; // Qui restituiamo l'intero payload (JSON inclusi)
  }

  async update(id: string, updateDto: UpdateCalibrationDto) {
    const existing = await this.findOne(id);

    // Se stiamo attivando questa calibrazione, disattiviamo prima le altre
    if (updateDto.isCurrent === true) {
      // Uso transaction sequenziale logica (il Prisma client gestisce il connection pool)
      await this.ensureSingleCurrentCalibration(existing.cameraId);
    }

    return this.prisma.calibration.update({
      where: { id },
      data: {
        mode: updateDto.mode,
        totalPosesPlanned: updateDto.totalPosesPlanned,
        anchorPose: updateDto.anchorPose ? (updateDto.anchorPose as any) : undefined,
        poses: updateDto.poses ? (updateDto.poses as any) : undefined,
        plate: updateDto.plate ? (updateDto.plate as any) : undefined,
        result: updateDto.result ? (updateDto.result as any) : undefined,
        isCurrent: updateDto.isCurrent,
        notes: updateDto.notes,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.calibration.delete({
      where: { id },
    });
  }
}