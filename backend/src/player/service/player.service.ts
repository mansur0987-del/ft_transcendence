import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from '../dto/creatPlayer.dto';
import { UpdatePlayerDto } from '../dto/updatePlayer.dto';
import { PlayerEntity } from '../entities/player.entity';
import AvatarService from './avatar.service';

@Injectable()
export class PlayerService {
	constructor (
		@InjectRepository(PlayerEntity)
	private readonly player_repository: Repository<PlayerEntity>,
	private readonly avatarService: AvatarService,
	) {}

	async GetALL(): Promise<PlayerEntity[]>{
		return await this.player_repository.find()
	}

	async GetPlayerById(id: number): Promise<PlayerEntity>{
		return await this.player_repository.findOneBy({id: id})
	}

	async GetPlayerByName(name: string): Promise<PlayerEntity>{
		return await this.player_repository.findOneBy({name: name})
	}

	async create(playerDto: CreatePlayerDto): Promise<PlayerEntity> {
		return await this.player_repository.save({
			name: playerDto.name,
        	name42: playerDto.name,
		})
	}

	async update(
		player: PlayerEntity,
		updatePlayerDto: UpdatePlayerDto,
	  ): Promise<PlayerEntity> {
		try {
			updatePlayerDto.id = player.id;
			return await this.player_repository.save(updatePlayerDto);
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

	async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
		const avatar = await this.avatarService.uploadDatabaseFile(imageBuffer, filename);
		await this.player_repository.update(userId, {
		  avatarId: avatar.id
		});
		return avatar;
	  }

	async getAvatar(userId: number){
		const player = await this.GetPlayerById(userId);
		const avatar = await this.avatarService.getFileById(player.avatarId)
		return avatar
	}
}
