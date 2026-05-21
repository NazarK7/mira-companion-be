// backend/src/cameras/cameras.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UploadedFile, UseInterceptors, Res, StreamableFile, NotFoundException,
  Logger
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CamerasService } from './cameras.service';
import { JobsService } from '../jobs/jobs.service'; // Assicurati che l'import sia corretto
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { multerDiskConfig } from '../storage/multer.config';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Controller('cameras')
export class CamerasController {
  private readonly logger = new Logger(CamerasController.name); // Aggiungiamo un logger
  constructor(
    private readonly camerasService: CamerasService,
    private readonly jobsService: JobsService, // <--- INIEZIONE CORRETTA
  ) { }

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
  @Res() res: Response, // Iniezione diretta di Express Response
) {
  const camera = await this.camerasService.findOne(id);
  const cam = camera;
  
  let fileName = '';
  let fileId = ''; 

  // Selezione asset
  if (type === 'mira3d') {
    fileName = cam.mira3dBackupName;
    fileId = cam.mira3dBackupPath;
  } else if (type === 'halcon') {
    fileName = cam.halconLicenseName;
    fileId = cam.halconLicensePath;
  } else if (type === 'restart') {
    fileName = cam.restartOnCrashName;
    fileId = cam.restartOnCrashPath;
  }

  if (!fileId || !fileName) {
    throw new NotFoundException(`Asset ${type} non configurato.`);
  }

  const absolutePath = path.join(process.cwd(), 'data', 'blobs', fileId);

  // Verifica fisica
  if (!fs.existsSync(absolutePath)) {
    this.logger.error(`File non trovato: ${absolutePath}`);
    // Se usi @Res(), devi inviare l'errore manualmente o usare res.status()
    return res.status(404).json({ message: 'File fisico non trovato sul server' });
  }

  // Esegui il download tramite Express
  res.download(absolutePath, fileName, (err) => {
    if (err) {
      this.logger.error(`Errore nel trasferimento: ${err.message}`);
      // Evitiamo di inviare un secondo header se la risposta è già partita
      if (!res.headersSent) {
        res.status(500).send('Errore durante il download');
      }
    }
  });
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