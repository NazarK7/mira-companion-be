// backend/src/jobs/dto/create-job-backup.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateJobBackupDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}