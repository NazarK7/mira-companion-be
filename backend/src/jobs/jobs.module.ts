// backend/src/jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { StorageModule } from '../storage/storage.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [StorageModule, DashboardModule], // Necessario per this.storage.deleteFile()
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}