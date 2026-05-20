import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { PlantsModule } from './plants/plants.module';
import { StationsModule } from './stations/stations.module';
import { CamerasModule } from './cameras/cameras.module';
import { RobotBackupsModule } from './robot-backups/robot-backups.module';
import { StorageModule } from './storage/storage.module';
import { JobsModule } from './jobs/jobs.module';
import { CalibrationsModule } from './calibrations/calibrations.module';
import { MaintenanceEventsModule } from './maintenance-events/maintenance-events.module';

@Module({
  imports: [
    StorageModule,
    PrismaModule, 
    CustomersModule, 
    PlantsModule, 
    StationsModule, CamerasModule, RobotBackupsModule, JobsModule, CalibrationsModule, MaintenanceEventsModule
  ],
})
export class AppModule {}
