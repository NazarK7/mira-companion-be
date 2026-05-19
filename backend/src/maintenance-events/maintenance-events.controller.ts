// backend/src/maintenance-events/maintenance-events.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { MaintenanceEventsService } from './maintenance-events.service';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';

@Controller('maintenance-events')
export class MaintenanceEventsController {
  constructor(private readonly maintenanceEventsService: MaintenanceEventsService) {}

  @Post()
  create(@Body() createDto: CreateMaintenanceEventDto) {
    return this.maintenanceEventsService.create(createDto);
  }

  @Get()
  findAll(@Query('cameraId') cameraId?: string) {
    return this.maintenanceEventsService.findAll(cameraId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceEventsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceEventsService.remove(id);
  }
}