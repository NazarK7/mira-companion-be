// backend/src/jobs/dto/create-job.dto.ts
import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateJobDto {
  @IsUUID()
  cameraId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  visionToolSlot?: number;
}