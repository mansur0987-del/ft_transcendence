import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { CreateChatDto } from "../dto/create-chat.dto";
import { Repository } from 'typeorm';
import { isUndefined } from "util";

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Chat)
  private readonly chat_repository: Repository<Chat>
  ) { }

  async addRawToChat(src: CreateChatDto):
  Promise<Chat>{
    return await this.chat_repository.save({
      isPrivate: src.isPrivate,
      chat_name: src.chat_name,
      have_password: src.have_password,
      password: src.password
    });
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
      isPrivate: newChatRaw.isPrivate,
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

  async findAllByType(isPrivate: boolean): Promise<Chat[]> {
    return await this.chat_repository.find({where: {isPrivate: isPrivate}});
  }
}
