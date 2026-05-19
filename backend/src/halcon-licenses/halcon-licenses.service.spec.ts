import { Test, TestingModule } from '@nestjs/testing';
import { HalconLicensesService } from './halcon-licenses.service';

describe('HalconLicensesService', () => {
  let service: HalconLicensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HalconLicensesService],
    }).compile();

    service = module.get<HalconLicensesService>(HalconLicensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
