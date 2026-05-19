// backend/src/halcon-licenses/dto/create-halcon-license.dto.ts
import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateHalconLicenseDto {
  @IsUUID()
  cameraId!: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}