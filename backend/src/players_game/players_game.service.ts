import { Injectable } from '@nestjs/common';
import { CreatePlayersGameDto } from './dto/create-players_game.dto';
import { UpdatePlayersGameDto } from './dto/update-players_game.dto';
import { Repository } from 'typeorm';

@Injectable()
export class PlayersGameService {
  create(createPlayersGameDto: CreatePlayersGameDto) {
    return 'This action adds a new playersGame';
  }

  findAll() {
    return `This action returns all playersGame`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playersGame`;
  }

  update(id: number, updatePlayersGameDto: UpdatePlayersGameDto) {
    return `This action updates a #${id} playersGame`;
  }

  remove(id: number) {
    return `This action removes a #${id} playersGame`;
  }
}
