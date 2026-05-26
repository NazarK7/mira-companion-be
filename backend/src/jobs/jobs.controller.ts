// backend/src/jobs/jobs.controller.ts
import {
  Patch, Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, Res, NotFoundException,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobBackupDto } from './dto/create-job-backup.dto';
import { multerDiskConfig } from '../storage/multer.config';
import { UpdateJobDto } from './dto/update-job.dto';
import type { Response } from 'express'; // <--- ASSICURATI CHE SIA DA 'express'
import * as path from 'node:path';
import * as fs from 'node:fs';

@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);
  constructor(private readonly jobsService: JobsService) { }

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

  // --- SUB-ROUTE: BACKUPS ---

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
    @Res() res: Response // <--- RIMOSSO passthrough: true
  ) {
    const backup = await this.jobsService.getBackup(backupId);

    if (!backup.filePath) {
      throw new NotFoundException('File fisico non presente per questo backup');
    }

    // Costruiamo il percorso assoluto come fatto per le Camere
    const absolutePath = path.join(process.cwd(), 'data', 'blobs', backup.filePath);

    if (!fs.existsSync(absolutePath)) {
      this.logger.error(`File non trovato su disco: ${absolutePath}`);
      return res.status(404).json({ message: 'Il file fisico è svanito dal server' });
    }

    const downloadName = backup.fileName || 'job_backup.zip';

    // DOWNLOAD DIRETTO EXPRESS
    res.download(absolutePath, downloadName, (err) => {
      if (err) {
        this.logger.error(`Errore durante il download: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).send('Errore nel trasferimento del file');
        }
      }
    });
  }


  @Delete('backups/:backupId')
  removeBackup(@Param('backupId') backupId: string) {
    return this.jobsService.removeBackup(backupId);
  }

  @Patch(':id')
  updateJob(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.updateJob(id, updateJobDto);
  }

  @Delete(':id')
  removeJob(@Param('id') id: string) {
    return this.jobsService.removeJob(id);
  }
}