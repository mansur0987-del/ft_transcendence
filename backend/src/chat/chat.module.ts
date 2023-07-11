import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Chat_members } from "./entities/chat_members.entity";
import { ChatMemberService } from "./services/chat_members.service";

@Module({
  imports: [TypeOrmModule.forFeature([Chat]), TypeOrmModule.forFeature([Chat_members])],
  controllers: [ChatController],
  providers: [ChatService, ChatMemberService]
})
export class ChatModule {}
