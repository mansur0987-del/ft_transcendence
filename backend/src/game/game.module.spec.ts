import { Test, TestingModule } from '@nestjs/testing';
import { GameModule } from './game.module';

describe('GameModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GameModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
