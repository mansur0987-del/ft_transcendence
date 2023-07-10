import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Chat)
  private readonly chat_repository: Repository<Chat>
  ) { }

  async addRawToChat(type_id: number, chat_name: string, isProtected: boolean, pass: string):
  Promise<Chat>{
    try {
      return await this.chat_repository.save({
      type_id: type_id,
      chat_name: chat_name,
      have_password: isProtected,
      password: pass
    });
    }
    catch (ex) {
      throw new Error(`addRawToChat error: ${ex.message}.`);
    }
  }

  async removeRawInChat(chat_id: number) {
    const chatRaw = await this.findOneById(chat_id);
    if (!chatRaw) { //check condition
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }
    await this.chat_repository.remove([chatRaw])
  }

  async updateRawInChat(id: number, newChatRaw: Chat): Promise<Chat> {
    try {
      this.removeRawInChat(id);
      return await this.chat_repository.save({
      id: id,
      type_id: newChatRaw.type_id,
      chat_name: newChatRaw.chat_name,
      have_password: newChatRaw.have_password,
      password: newChatRaw.password
    });
    }
    catch (ex) {
      throw new Error(`addRawToChat error: ${ex.message}.`);
    }
  }

  async findAll() : Promise<Chat[]> {
    return await this.chat_repository.find();
    // `This action returns all chat;
  }

  async findOneById(chat_id: number) : Promise<Chat>{
    return await this.chat_repository.findOne({where: {id: chat_id}});
    //return `This action returns a #${id} chat`;
  }

  async findAllByType(type_id: number): Promise<Chat[]> {
    return await this.chat_repository.find({where: {type_id: type_id}});
  }
}
