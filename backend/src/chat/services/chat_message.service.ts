import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat_messages } from '../entities/chat_messages.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatMessageService {
  constructor(@InjectRepository(Chat_messages)
  private readonly chat_messages_repository: Repository<Chat_messages>
  ) { }

  async addRawToChatMessage(chat_id: number, player_id: number, message: string, sent_ts: Date):
    Promise<Chat_messages> {
    try {
      return await this.chat_messages_repository.save({
        chat_id: chat_id,
        player_id: player_id,
        message: message,
        sent_ts: sent_ts
      });
    }
    catch (ex) {
      throw new Error(`addRawToChatMessage error: ${ex.message}.`);
    }
  }

  async findById(id: number): Promise<Chat_messages> {
    return await this.chat_messages_repository.findOne({ where: { id: id } });
  }

  async findAllByChatId(chat_id: number): Promise<Chat_messages[]> {
    return await this.chat_messages_repository.find({ where: { chat_id: chat_id } });
  }

  async findAllByPlayerIdChatId(chat_id: number, player_id: number): Promise<Chat_messages[]> {
    return await this.chat_messages_repository.find({ where: { chat_id: chat_id, player_id: player_id } });
  }

  async findAllInChatMessagesBetween(chat_id: number, ts1: Date, ts2: Date): Promise<Chat_messages[]> {
    return await this.chat_messages_repository.createQueryBuilder()
      .select('id, chat_id, player_id, message, sent_ts')
      .where("Chat_messages.chat_id= :chat_id", { chat_id: chat_id })
      .andWhere("Chat_messages.sent_ts between :ts1 and ts2", { ts1: ts1, ts2: ts2 }).getRawMany();
  }

  async findAllByChatIdInOrder(chat_id: number): Promise<Chat_messages[]> {
    return await this.chat_messages_repository.createQueryBuilder()
      .select('Chat_messages.id, Chat_messages.chat_id, Chat_messages.player_id, Chat_messages.message, Chat_messages.sent_ts')
      .where("Chat_messages.chat_id= :chat_id", { chat_id: chat_id })
      .orderBy("Chat_messages.sent_ts").getRawMany();
  }

  async removeAllByChatId(chat_id: number) {
    let toRemove: Chat_messages[] = await this.findAllByChatId(chat_id);
    await this.chat_messages_repository.remove(await toRemove);
  }
}
