import { Test, TestingModule } from '@nestjs/testing';
import { TypeChatService } from './type_chat.service';

describe('TypeChatService', () => {
  let service: TypeChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeChatService],
    }).compile();

    service = module.get<TypeChatService>(TypeChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
