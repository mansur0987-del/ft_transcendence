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
import { Direct_R } from "./entities/directRelationship.entity";
import { directRService } from "./services/directRelationships.service";
import { ChatGateway } from "./chat.gateway"
import { AuthModule } from "src/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Chat_members, Chat_messages, Player_blocks, Direct_R]), PlayerModule, JwtModule],
  controllers: [ChatController],
  providers: [ChatService, ChatMemberService, ChatMessageService, PlayerBlocksService, directRService, ChatGateway, ChatController]
})
export class ChatModule { }
