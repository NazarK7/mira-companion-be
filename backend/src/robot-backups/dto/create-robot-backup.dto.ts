// backend/src/robot-backups/dto/create-robot-backup.dto.ts
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateRobotBackupDto {
  @IsUUID()
  cameraId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}