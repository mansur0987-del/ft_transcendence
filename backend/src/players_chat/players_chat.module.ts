import { Module } from '@nestjs/common';
import { PlayersChatService } from './players_chat.service';
import { PlayersChatController } from './players_chat.controller';

@Module({
  controllers: [PlayersChatController],
  providers: [PlayersChatService]
})
export class PlayersChatModule {}
