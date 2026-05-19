import { Test, TestingModule } from '@nestjs/testing';
import { RobotBackupsController } from './robot-backups.controller';

describe('RobotBackupsController', () => {
  let controller: RobotBackupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RobotBackupsController],
    }).compile();

    controller = module.get<RobotBackupsController>(RobotBackupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
