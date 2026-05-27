import {
  Patch, Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, Res, NotFoundException, Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobBackupDto } from './dto/create-job-backup.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { multerDiskConfig } from '../storage/multer.config';
import type { Response } from 'express';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);
  
  constructor(private readonly jobsService: JobsService) { }

  // --- CRUD JOB PRINCIPALE ---
  
  @Post()
  createJob(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(createJobDto);
  }

  @Get()
  findAllJobs(@Query('cameraId') cameraId?: string) {
    return this.jobsService.findAllJobs(cameraId);
  }

  @Get(':id')
  findOneJob(@Param('id') id: string) {
    return this.jobsService.findOneJob(id);
  }

  @Patch(':id')
  updateJob(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.updateJob(id, updateJobDto);
  }

  @Delete(':id')
  removeJob(@Param('id') id: string) {
    return this.jobsService.removeJob(id);
  }

  // --- SUB-ROUTE: BACKUPS LOGICI ---

  @Post(':id/backups')
  @UseInterceptors(FileInterceptor('file', multerDiskConfig))
  addBackup(
    @Param('id') jobId: string,
    @Body() dto: CreateJobBackupDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    return this.jobsService.addBackup(jobId, dto, file);
  }

  @Get('backups/:backupId/download')
  async downloadBackup(
    @Param('backupId') backupId: string,
    @Res() res: Response
  ) {
    const backup = await this.jobsService.getBackup(backupId);

    if (!backup.filePath) {
      throw new NotFoundException('File fisico non presente per questo backup');
    }

    const absolutePath = path.join(process.cwd(), 'data', 'blobs', backup.filePath);

    if (!fs.existsSync(absolutePath)) {
      this.logger.error(`File non trovato su disco: ${absolutePath}`);
      return res.status(404).json({ message: 'Il file fisico è svanito dal server' });
    }

    res.download(absolutePath, backup.fileName || 'job_backup.zip', (err) => {
      if (err) {
        this.logger.error(`Errore durante il download: ${err.message}`);
        if (!res.headersSent) res.status(500).send('Errore nel trasferimento del file');
      }
    });
  }

  @Delete('backups/:backupId')
  removeBackup(@Param('backupId') backupId: string) {
    return this.jobsService.removeBackup(backupId);
  }

  // --- SUB-ROUTE: DATASET IMMAGINI ---

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file', multerDiskConfig))
  addTestImageArchive(
    @Param('id') jobId: string,
    @Body('notes') notes: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    return this.jobsService.addTestImageArchive(jobId, notes, file);
  }

  @Get('images/:imageId/download')
  async downloadTestImageArchive(
    @Param('imageId') imageId: string,
    @Res() res: Response
  ) {
    const image = await this.jobsService.getTestImageArchive(imageId);

    if (!image.filePath) {
      throw new NotFoundException('File fisico non presente');
    }

    const absolutePath = path.join(process.cwd(), 'data', 'blobs', image.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File mancante su disco' });
    }

    res.download(absolutePath, image.fileName || 'job_images.zip', (err) => {
      if (err && !res.headersSent) res.status(500).send('Errore trasferimento');
    });
  }

  @Delete('images/:imageId')
  removeTestImageArchive(@Param('imageId') imageId: string) {
    return this.jobsService.removeTestImageArchive(imageId);
  }
}