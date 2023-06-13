import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Chat)
  private readonly chat_repository: Repository<Chat>,
  ) { }

  create(createChatDto: CreateChatDto) {
    return 'This action adds a new chat';
  }

  async findAll() : Promise<Chat[]> {
    return await this.chat_repository.find();
    // `This action returns all chat`;
  }

  async findOne(id: number) : Promise<Chat>{
    return await this.chat_repository.findOne({where: {id: id}});
    //return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
