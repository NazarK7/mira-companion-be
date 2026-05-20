import { Module } from '@nestjs/common';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { JobsModule } from '../jobs/jobs.module';
@Module({
  imports: [JobsModule],
  controllers: [CamerasController],
  providers: [CamerasService]
})
export class CamerasModule {}
