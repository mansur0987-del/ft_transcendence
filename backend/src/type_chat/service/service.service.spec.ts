import { Test, TestingModule } from '@nestjs/testing';
import { type_chat_Service } from './service.service';

describe('ServiceService', () => {
  let service: type_chat_Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [type_chat_Service],
    }).compile();

    service = module.get<type_chat_Service>(type_chat_Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
