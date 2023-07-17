import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { CreateChatDto } from "../dto/create-chat.dto";
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Chat)
  private readonly chat_repository: Repository<Chat>
  ) { }

  async addRawToChat(src: CreateChatDto):
    Promise<Chat> {
    return await this.chat_repository.save({
      chat_name: src.chat_name,
      isPrivate: src.isPrivate,
      isDirect: false,
      have_password: src.have_password,
      password: src.password
    });
  }

  async addDirectRawToChat():
    Promise<Chat> {
    return await this.chat_repository.save({
      chat_name: 'direct ',
      isPrivate: true,
      isDirect: true,
      have_password: false,
      password: null
    });
  }

  async removeRawInChat(chat_id: number) {
    const chatRaw = await this.findOneById(chat_id);
    if (!chatRaw) { //check condition
      throw new NotFoundException('Chat not found');
    }
    await this.chat_repository.remove([chatRaw])
  }

  async updateRawInChat(id: number, newChatRaw: Chat): Promise<Chat> {
    try {
      return (await this.chat_repository.update({ id: id}, {
        chat_name: newChatRaw.chat_name,
        isPrivate: newChatRaw.isPrivate,
        isDirect: false,
        have_password: newChatRaw.have_password,
        password: newChatRaw.password
      })).raw;
    }
    catch (ex) {
      throw new Error(`addRawToChat error: ${ex.message}.`);
    }
  }

  async findAll(): Promise<Chat[]> {
    return await this.chat_repository.find();
  }

  async findOneById(chat_id: number): Promise<Chat> {
    return await this.chat_repository.findOne({ where: { id: chat_id } });
  }

  async findAllByType(isPrivate: boolean): Promise<Chat[]> {
    return await this.chat_repository.find({ where: { isPrivate: isPrivate } });
  }

  async findOneByName(chat_name: string): Promise<Chat> {
    return await this.chat_repository.findOne({ where: { chat_name: chat_name } });
  }
}