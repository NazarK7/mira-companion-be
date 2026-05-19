// backend/src/cameras/cameras.controller.ts
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
import { CamerasService } from './cameras.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@Controller('cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Post()
  create(@Body() createCameraDto: CreateCameraDto) {
    return this.camerasService.create(createCameraDto);
  }

  @Get()
  findAll(@Query('stationId') stationId?: string) {
    return this.camerasService.findAll(stationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // ID è trattato rigorosamente come stringa/UUID. Nessun cast numerico.
    return this.camerasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateCameraDto: UpdateCameraDto
  ) {
    return this.camerasService.update(id, updateCameraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.camerasService.remove(id);
  }
}