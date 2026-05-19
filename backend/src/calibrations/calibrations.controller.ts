// backend/src/calibrations/calibrations.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query 
} from '@nestjs/common';
import { CalibrationsService } from './calibrations.service';
import { CreateCalibrationDto } from './dto/create-calibration.dto';
import { UpdateCalibrationDto } from './dto/update-calibration.dto';

@Controller('calibrations')
export class CalibrationsController {
  constructor(private readonly calibrationsService: CalibrationsService) {}

  @Post()
  create(@Body() createCalibrationDto: CreateCalibrationDto) {
    return this.calibrationsService.create(createCalibrationDto);
  }

  @Get()
  findAll(@Query('cameraId') cameraId?: string) {
    return this.calibrationsService.findAll(cameraId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calibrationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalibrationDto: UpdateCalibrationDto) {
    return this.calibrationsService.update(id, updateCalibrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calibrationsService.remove(id);
  }
}