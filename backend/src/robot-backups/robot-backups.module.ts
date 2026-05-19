import { Module } from '@nestjs/common';
import { RobotBackupsController } from './robot-backups.controller';
import { RobotBackupsService } from './robot-backups.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [RobotBackupsController],
  providers: [RobotBackupsService]
})
export class RobotBackupsModule {}
