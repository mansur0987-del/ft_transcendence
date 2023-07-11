import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { CreateChatDto } from "../dto/create-chat.dto";
import { Repository } from 'typeorm';
// import { PlayerEntity } from "src/player/entities/player.entity";
import { NotFoundError } from "rxjs";
// import { isUndefined } from "util";

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Chat)
  private readonly chat_repository: Repository<Chat>
  ) { }

  async addRawToChat(src: CreateChatDto):
  Promise<Chat>{
    console.log(src);
    return await this.chat_repository.save({
      chat_name: src.chat_name,
      isPrivate: src.isPrivate,
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

  async findOneByName(chat_name: string): Promise<Chat>{
    return await this.chat_repository.findOne({where: {chat_name: chat_name}});
  }

  // async getPlayerName(player_id: number): Promise<string>{
  //   const player: any = await this.PlayerEntity.findOne({where: {id: player_id}});
  //   if (!player || !player.name)
  //     throw new NotFoundException('player not found');
  //   return player.name;
  // }
}
