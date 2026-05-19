// backend/src/jobs/dto/update-job.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  visionToolSlot?: number;
}