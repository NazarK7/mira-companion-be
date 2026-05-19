// backend/src/maintenance-events/dto/create-maintenance-event.dto.ts
import { IsString, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { MaintenanceCategory } from '@prisma/client';

export class CreateMaintenanceEventDto {
  @IsUUID()
  cameraId!: string;

  @IsDateString()
  occurredAt!: string;

  @IsEnum(MaintenanceCategory)
  category!: MaintenanceCategory;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  performedBy?: string;
}