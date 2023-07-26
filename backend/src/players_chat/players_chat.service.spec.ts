import { Test, TestingModule } from '@nestjs/testing';
import { PlayersChatService } from './players_chat.service';

describe('PlayersChatService', () => {
  let service: PlayersChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayersChatService],
    }).compile();

    service = module.get<PlayersChatService>(PlayersChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
