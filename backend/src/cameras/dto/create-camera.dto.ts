// backend/src/cameras/dto/create-camera.dto.ts
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsNumber, 
  IsUUID, 
  IsArray 
} from 'class-validator';
import { CameraType, RobotControllerType, CameraStatus } from '@prisma/client';

export class CreateCameraDto {
  @IsUUID()
  stationId!: string;

  @IsString()
  name!: string;

  @IsEnum(CameraType)
  type!: CameraType;

  @IsOptional()
  @IsString()
  cameraModel?: string;

  @IsOptional()
  @IsNumber()
  lensFocalMm?: number;

  @IsOptional()
  @IsString()
  firmware?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsEnum(RobotControllerType)
  controllerType?: RobotControllerType;

  @IsOptional()
  @IsString()
  plcNotes?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(CameraStatus)
  status?: CameraStatus;
}