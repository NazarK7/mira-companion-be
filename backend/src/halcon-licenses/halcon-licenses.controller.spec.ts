import { Test, TestingModule } from '@nestjs/testing';
import { HalconLicensesController } from './halcon-licenses.controller';

describe('HalconLicensesController', () => {
  let controller: HalconLicensesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HalconLicensesController],
    }).compile();

    controller = module.get<HalconLicensesController>(HalconLicensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
