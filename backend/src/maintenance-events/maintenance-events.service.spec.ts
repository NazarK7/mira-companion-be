import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceEventsService } from './maintenance-events.service';

describe('MaintenanceEventsService', () => {
  let service: MaintenanceEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceEventsService],
    }).compile();

    service = module.get<MaintenanceEventsService>(MaintenanceEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
