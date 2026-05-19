// backend/src/halcon-licenses/halcon-licenses.controller.ts
import {
  Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, StreamableFile, Res, NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { HalconLicensesService } from './halcon-licenses.service';
import { CreateHalconLicenseDto } from './dto/create-halcon-license.dto';
import { multerDiskConfig } from '../storage/multer.config';

@Controller('halcon-licenses')
export class HalconLicensesController {
  constructor(private readonly halconLicensesService: HalconLicensesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerDiskConfig))
  create(
    @Body() createDto: CreateHalconLicenseDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })], // 100MB max
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    return this.halconLicensesService.create(createDto, file);
  }

  @Get()
  findAll(@Query('cameraId') cameraId?: string) {
    return this.halconLicensesService.findAll(cameraId);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const license = await this.halconLicensesService.findOne(id);
    if (!license.filePath) throw new NotFoundException('File fisico non presente');

    const fileStream = this.halconLicensesService.getFileStream(license.filePath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${license.fileName || 'license.zip'}"`,
    });
    return new StreamableFile(fileStream);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.halconLicensesService.remove(id);
  }
}