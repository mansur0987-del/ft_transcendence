import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from '../dto/creatPlayer.dto';
import { UpdatePlayerDto } from '../dto/updatePlayer.dto';
import { PlayerEntity } from '../entities/player.entity';

@Injectable()
export class PlayerService {
	constructor (
		@InjectRepository(PlayerEntity)
	private readonly player_repository: Repository<PlayerEntity>
	) {}

	async GetALL(): Promise<PlayerEntity[]>{
		return await this.player_repository.find()
	}

	async GetPlayerById(id: number): Promise<PlayerEntity>{
		return await this.player_repository.findOneBy({id: id})
	}

	async GetPlayerByName(name: string): Promise<PlayerEntity>{
		const PlayerInDb = await this.player_repository.findOneBy({name: name})
		return PlayerInDb
	}

	async create(playerDto: CreatePlayerDto): Promise<PlayerEntity> {
		const { name } = playerDto;
		await this.player_repository.save({
			name: name,
        	name42: name,
		})
		return await this.GetPlayerByName(name);
	}

	async update(
		player: PlayerEntity,
		updatePlayerDto: UpdatePlayerDto,
	  ): Promise<PlayerEntity> {
		try {
			updatePlayerDto.id = player.id;
			await this.player_repository.save(updatePlayerDto);
			return await this.GetPlayerById(updatePlayerDto.id);
		}
		catch (ex) {
			throw new Error(`Update error: ${ex.message}.`);
		}
	}

	async remove(id: number): Promise<boolean> {
		const playerInDb = await this.GetPlayerById(id);
		if (playerInDb) {
		  throw new HttpException('Player not found', HttpStatus.BAD_REQUEST);
		}
		await this.player_repository.remove([playerInDb])
		return true;
	}

}
