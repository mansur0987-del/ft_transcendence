import { Injectable } from '@nestjs/common';
import { CreatePlayersChatDto } from './dto/create-players_chat.dto';
import { UpdatePlayersChatDto } from './dto/update-players_chat.dto';

@Injectable()
export class PlayersChatService {
  create(createPlayersChatDto: CreatePlayersChatDto) {
    return 'This action adds a new playersChat';
  }

  findAll() {
    return `This action returns all playersChat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playersChat`;
  }

  update(id: number, updatePlayersChatDto: UpdatePlayersChatDto) {
    return `This action updates a #${id} playersChat`;
  }

  remove(id: number) {
    return `This action removes a #${id} playersChat`;
  }
}
