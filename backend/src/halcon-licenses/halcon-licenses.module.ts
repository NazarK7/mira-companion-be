import { Module } from '@nestjs/common';
import { HalconLicensesController } from './halcon-licenses.controller';
import { HalconLicensesService } from './halcon-licenses.service';

@Module({
  controllers: [HalconLicensesController],
  providers: [HalconLicensesService]
})
export class HalconLicensesModule {}
