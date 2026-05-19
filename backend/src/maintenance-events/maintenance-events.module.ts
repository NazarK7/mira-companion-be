import { Module } from '@nestjs/common';
import { MaintenanceEventsController } from './maintenance-events.controller';
import { MaintenanceEventsService } from './maintenance-events.service';

@Module({
  controllers: [MaintenanceEventsController],
  providers: [MaintenanceEventsService]
})
export class MaintenanceEventsModule {}
