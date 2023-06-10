import { Test, TestingModule } from '@nestjs/testing';
import { PlayersGameController } from './players_game.controller';
import { PlayersGameService } from './players_game.service';

describe('PlayersGameController', () => {
  let controller: PlayersGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersGameController],
      providers: [PlayersGameService],
    }).compile();

    controller = module.get<PlayersGameController>(PlayersGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
