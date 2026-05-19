// backend/src/calibrations/dto/update-calibration.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCalibrationDto } from './create-calibration.dto';

export class UpdateCalibrationDto extends PartialType(CreateCalibrationDto) {}