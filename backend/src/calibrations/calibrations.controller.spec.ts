import { Test, TestingModule } from '@nestjs/testing';
import { CalibrationsController } from './calibrations.controller';

describe('CalibrationsController', () => {
  let controller: CalibrationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalibrationsController],
    }).compile();

    controller = module.get<CalibrationsController>(CalibrationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
