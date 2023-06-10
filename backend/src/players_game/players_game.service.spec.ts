import { Test, TestingModule } from '@nestjs/testing';
import { PlayersGameService } from './players_game.service';

describe('PlayersGameService', () => {
  let service: PlayersGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayersGameService],
    }).compile();

    service = module.get<PlayersGameService>(PlayersGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
