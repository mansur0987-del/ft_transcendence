import { Test, TestingModule } from '@nestjs/testing';
import { PlayersAchievService } from './players_achiev.service';

describe('PlayersAchievService', () => {
  let service: PlayersAchievService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayersAchievService],
    }).compile();

    service = module.get<PlayersAchievService>(PlayersAchievService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
