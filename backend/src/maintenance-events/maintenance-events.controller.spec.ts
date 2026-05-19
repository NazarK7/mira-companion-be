import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceEventsController } from './maintenance-events.controller';

describe('MaintenanceEventsController', () => {
  let controller: MaintenanceEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceEventsController],
    }).compile();

    controller = module.get<MaintenanceEventsController>(MaintenanceEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
