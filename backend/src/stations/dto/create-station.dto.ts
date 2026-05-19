// backend/src/stations/dto/create-station.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsDateString, IsArray } from 'class-validator';
import { StationStatus } from '@prisma/client';

export class CreateStationDto {
  @IsUUID()
  @IsNotEmpty()
  plantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  line?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  installDate?: string;

  @IsString()
  @IsOptional()
  recoveryProcedure?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(StationStatus)
  @IsOptional()
  status?: StationStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}