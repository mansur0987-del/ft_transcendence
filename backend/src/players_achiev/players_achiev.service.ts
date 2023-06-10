import { Injectable } from '@nestjs/common';
import { CreatePlayersAchievDto } from './dto/create-players_achiev.dto';
import { UpdatePlayersAchievDto } from './dto/update-players_achiev.dto';

@Injectable()
export class PlayersAchievService {
  create(createPlayersAchievDto: CreatePlayersAchievDto) {
    return 'This action adds a new playersAchiev';
  }

  findAll() {
    return `This action returns all playersAchiev`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playersAchiev`;
  }

  update(id: number, updatePlayersAchievDto: UpdatePlayersAchievDto) {
    return `This action updates a #${id} playersAchiev`;
  }

  remove(id: number) {
    return `This action removes a #${id} playersAchiev`;
  }
}
