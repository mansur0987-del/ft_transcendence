import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';
import { chat_messages } from "./entities/chat_messages.entity";
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Chat)
  private readonly chat_repository: Repository<Chat>
  ) { }

  async addRawToChat(type_id: number, isProtected: boolean, pass: string): Promise<Chat>{
    return await this.chat_repository.save({
      type_id: type_id,
      have_password: isProtected,
      password: pass
    });
  }

  async removeRawInChat(chat_id: number) {
    const chatRaw = await this.findOneById(chat_id);
    if (!chatRaw) { //check condition
      throw new HttpException('Chat not found', HttpStatus.BAD_REQUEST);
    }
    await this.chat_repository.remove([chatRaw])
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

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }
}
