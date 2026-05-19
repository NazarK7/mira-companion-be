import { Test, TestingModule } from '@nestjs/testing';
import { RobotBackupsService } from './robot-backups.service';

describe('RobotBackupsService', () => {
  let service: RobotBackupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RobotBackupsService],
    }).compile();

    service = module.get<RobotBackupsService>(RobotBackupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
