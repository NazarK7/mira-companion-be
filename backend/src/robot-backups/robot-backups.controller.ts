// backend/src/robot-backups/robot-backups.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  StreamableFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { RobotBackupsService } from './robot-backups.service';
import { CreateRobotBackupDto } from './dto/create-robot-backup.dto';
import { multerDiskConfig } from '../storage/multer.config';

@Controller('robot-backups')
export class RobotBackupsController {
  constructor(private readonly robotBackupsService: RobotBackupsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerDiskConfig))
  create(
    @Body() createRobotBackupDto: CreateRobotBackupDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.robotBackupsService.create(createRobotBackupDto, file);
  }

  @Get()
  findAll(@Query('cameraId') cameraId?: string) {
    return this.robotBackupsService.findAll(cameraId);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const backup = await this.robotBackupsService.findOne(id);

    // FIX: Usiamo le proprietà corrette allineate allo schema.prisma
    if (!backup.filePath) {
      throw new NotFoundException('File fisico non associato a questo backup');
    }

    const fileStream = this.robotBackupsService.getFileStream(backup.filePath);
    const downloadName = backup.fileName || 'backup_robot.zip';

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
    });

    return new StreamableFile(fileStream);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.robotBackupsService.remove(id);
  }
}