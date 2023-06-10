import { Test, TestingModule } from '@nestjs/testing';
import { PlayersChatController } from './players_chat.controller';
import { PlayersChatService } from './players_chat.service';

describe('PlayersChatController', () => {
  let controller: PlayersChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersChatController],
      providers: [PlayersChatService],
    }).compile();

    controller = module.get<PlayersChatController>(PlayersChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
