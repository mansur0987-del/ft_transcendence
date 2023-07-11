import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player_blocks } from "../entities/players_blocks.entity";

@Injectable()
export class PlayerBlocksService {
  constructor(@InjectRepository(Player_blocks)
  private readonly players_blocks_repository: Repository<Player_blocks>
  ) { }

  async addRawInPlayerBlocks(player_id: number, blocked_player_id: number): Promise<Player_blocks> {
    return await this.players_blocks_repository.save({player_id: player_id, blocked_player_id: blocked_player_id});
  }

  async deleteRawFromPlayerBlocks(player_id: number, blocked_player_id: number) {
    const toRemove = this.findOneByIds(player_id, blocked_player_id);
    if (!toRemove) {
      throw new HttpException('PlayerBlocks not found', HttpStatus.NOT_FOUND);
    }
    await this.players_blocks_repository.remove(await toRemove);
  }

  async findOneByIds(player_id: number, blocked_player_id: number): Promise<Player_blocks> {
    return await this.players_blocks_repository.findOne({where: {player_id: player_id, blocked_player_id: blocked_player_id}})
  }

  async findAllByPlayerId(player_id: number): Promise<Player_blocks[]> {
    return await this.players_blocks_repository.find({where: {player_id: player_id}});
  }
}
