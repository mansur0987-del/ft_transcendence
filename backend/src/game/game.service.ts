import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { CreateGameDTO } from './dto/create-game.dto';
import { UpdateGameDTO } from './dto/update-game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async create(createGameDTO: CreateGameDTO): Promise<Game> {
    const game = this.gameRepository.create(createGameDTO);
    return this.gameRepository.save(game);
  }

  async findById(id: number): Promise<Game> {
    const games = await this.gameRepository.find({ where: { id } });
    return games.length > 0 ? games[0] : null;
  }

  async update(id: number, updateGameDTO: UpdateGameDTO): Promise<Game> {
    const game = await this.findById(id);
    if (!game) {
      throw new Error('Game not found');
    }
    Object.assign(game, updateGameDTO);
    return this.gameRepository.save(game);
  }

  async remove(id: number): Promise<void> {
    await this.gameRepository.delete(id);
  }
}
