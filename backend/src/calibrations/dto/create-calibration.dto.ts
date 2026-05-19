// backend/src/calibrations/dto/create-calibration.dto.ts
import { 
  IsString, 
  IsEnum, 
  IsInt, 
  IsObject, 
  IsArray, 
  IsBoolean, 
  IsOptional, 
  IsUUID 
} from 'class-validator';
import { CalibrationMode } from '@prisma/client';

export class CreateCalibrationDto {
  @IsUUID()
  cameraId!: string;

  @IsEnum(CalibrationMode)
  mode!: CalibrationMode;

  @IsInt()
  totalPosesPlanned!: number;

  @IsObject()
  anchorPose!: Record<string, any>;

  @IsArray()
  poses!: any[];

  @IsObject()
  plate!: Record<string, any>;

  @IsOptional()
  @IsObject()
  result?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}