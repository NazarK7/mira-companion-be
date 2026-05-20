// backend/src/cameras/cameras.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UploadedFile, UseInterceptors, Res, StreamableFile, NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CamerasService } from './cameras.service';
import { JobsService } from '../jobs/jobs.service'; // Assicurati che l'import sia corretto
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { multerDiskConfig } from '../storage/multer.config';
import type { Response } from 'express';

@Controller('cameras')
export class CamerasController {
  constructor(
    private readonly camerasService: CamerasService,
    private readonly jobsService: JobsService, // <--- INIEZIONE CORRETTA
  ) {}

  @Post()
  create(@Body() createCameraDto: CreateCameraDto) {
    return this.camerasService.create(createCameraDto);
  }

  @Get()
  findAll(
    @Query('stationId') stationId?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.camerasService.findAll({ stationId, search, skip, take });
  }

  @Post(':id/assets/:type')
  @UseInterceptors(FileInterceptor('file', multerDiskConfig))
  async uploadAsset(
    @Param('id') id: string,
    @Param('type') type: 'mira3d' | 'halcon' | 'restart',
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.camerasService.updateAsset(id, type, file);
  }

  @Get(':id/assets/:type/download')
  async downloadAsset(
    @Param('id') id: string,
    @Param('type') type: 'mira3d' | 'halcon' | 'restart',
    @Res({ passthrough: true }) res: Response,
  ) {
    const camera = await this.camerasService.findOne(id);
    let fileName: string | null = '';
    let filePath: string | null = '';

    // Uso cast 'any' per evitare errori TS2339 temporanei
    const cam = camera as any;

    if (type === 'mira3d') {
      fileName = cam.mira3dBackupName;
      filePath = cam.mira3dBackupPath;
    } else if (type === 'halcon') {
      fileName = cam.halconLicenseName;
      filePath = cam.halconLicensePath;
    } else if (type === 'restart') {
      fileName = cam.restartOnCrashName;
      filePath = cam.restartOnCrashPath;
    }

    if (!filePath || !fileName) {
      throw new NotFoundException(`Il file ZIP di tipo ${type} non è stato ancora caricato.`);
    }

    const fileStream = this.jobsService.getBackupFileStream(filePath);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(fileStream);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.camerasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCameraDto: UpdateCameraDto) {
    return this.camerasService.update(id, updateCameraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.camerasService.remove(id);
  }
}