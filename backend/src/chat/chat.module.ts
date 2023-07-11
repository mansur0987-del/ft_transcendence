import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Chat_members } from "./entities/chat_members.entity";
import { ChatMemberService } from "./services/chat_members.service";
import { PlayerModule } from "src/player/player.module";
import { Chat_messages } from "./entities/chat_messages.entity";
import { ChatMessageService } from "./services/chat_message.service";
import { Player_blocks } from "./entities/players_blocks.entity";
import { PlayerBlocksService } from "./services/players_blocks.service";

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Chat_members, Chat_messages, Player_blocks]), PlayerModule],
  controllers: [ChatController],
  providers: [ChatService, ChatMemberService, ChatMessageService, PlayerBlocksService]
})
export class ChatModule {}
