import { Module } from '@nestjs/common';
import { TypeChatService } from './type_chat.service';
import { TypeChatController } from './type_chat.controller';

@Module({
  controllers: [TypeChatController],
  providers: [TypeChatService]
})
export class TypeChatModule {}
