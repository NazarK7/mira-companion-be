import { Test, TestingModule } from '@nestjs/testing';
import { CalibrationsService } from './calibrations.service';

describe('CalibrationsService', () => {
  let service: CalibrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalibrationsService],
    }).compile();

    service = module.get<CalibrationsService>(CalibrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
