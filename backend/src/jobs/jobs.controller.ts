// backend/src/jobs/jobs.controller.ts
import {
  Put, Patch,
  Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, StreamableFile, Res, NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobBackupDto } from './dto/create-job-backup.dto';
import { multerDiskConfig } from '../storage/multer.config';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
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
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    return this.jobsService.addBackup(jobId, dto, file);
  }

  @Get('backups/:backupId/download')
  async downloadBackup(@Param('backupId') backupId: string, @Res({ passthrough: true }) res: Response) {
    const backup = await this.jobsService.getBackup(backupId);

    if (!backup.filePath) {
      throw new NotFoundException('File fisico non presente per questo backup');
    }

    const fileStream = this.jobsService.getBackupFileStream(backup.filePath);
    const downloadName = backup.fileName || 'job_backup.zip';

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
    });

    return new StreamableFile(fileStream);
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