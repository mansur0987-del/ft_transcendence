import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player_entitiy } from '../entities/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerService {
	constructor (
		@InjectRepository(Player_entitiy)
	private readonly player_repository: Repository<Player_entitiy>
	) {}

	async GetALL(): Promise<Player_entitiy[]>{
		return await this.player_repository.find()
	}

	async Get_player(id: number): Promise<Player_entitiy>{
		const player = await this.player_repository.findOne({where: {id:id}})
		if (!player) throw new HttpException('Player not found', HttpStatus.NOT_FOUND)
		else return player
	}
}
