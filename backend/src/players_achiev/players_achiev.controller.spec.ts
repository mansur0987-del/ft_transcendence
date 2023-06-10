import { Test, TestingModule } from '@nestjs/testing';
import { PlayersAchievController } from './players_achiev.controller';
import { PlayersAchievService } from './players_achiev.service';

describe('PlayersAchievController', () => {
  let controller: PlayersAchievController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersAchievController],
      providers: [PlayersAchievService],
    }).compile();

    controller = module.get<PlayersAchievController>(PlayersAchievController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
