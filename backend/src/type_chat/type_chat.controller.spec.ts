import { Test, TestingModule } from '@nestjs/testing';
import { TypeChatController } from './type_chat.controller';
import { TypeChatService } from './type_chat.service';

describe('TypeChatController', () => {
  let controller: TypeChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeChatController],
      providers: [TypeChatService],
    }).compile();

    controller = module.get<TypeChatController>(TypeChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
