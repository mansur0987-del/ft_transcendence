import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePlayerDto } from '../dto/creatPlayer.dto';
import { UpdatePlayerDto } from '../dto/updatePlayer.dto';
import { PlayerEntity } from '../entities/player.entity';
import AvatarService from './avatar.service';
import fs = require('fs');
import path = require('path');
import { PlayerStatus } from '../enums/playerStatus.enum';
import PlayerApplcationService from './playerApplication.service';
import QrCodeService from "./qrcode.service";

@Injectable()
export class PlayerService {
	constructor (
		@InjectRepository(PlayerEntity)
	private readonly player_repository: Repository<PlayerEntity>,
	private readonly avatarService: AvatarService,
	private readonly playerApplication: PlayerApplcationService,
	private readonly qrCodeServise: QrCodeService
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

	async GetPlayerByName42(name42: string): Promise<PlayerEntity>{
		return await this.player_repository.findOneBy({name42: name42})
	}

	async create(playerDto: CreatePlayerDto): Promise<PlayerEntity> {
		const file: Buffer = await fs.readFileSync(
			path.resolve(
				'../user.png',
			),
		)
		const avatar = await this.avatarService.uploadDatabaseFile(file, 'default')
		const result = await this.player_repository.save({
			name: 'guest_',
        	name42: playerDto.name42,
			avatarId: avatar.id,
			status: PlayerStatus.ONLINE
		});
		let Upd = result;
		Upd.name += result.id.toString();
		return await this.update(result, Upd);
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

	async addQrCode(userId: number, imageBuffer: Buffer, filename: string) {
		const QrCode = await this.qrCodeServise.uploadDatabaseFile(imageBuffer, filename);
		await this.player_repository.update(userId, {
		  qrcodeId: QrCode.id
		});
		return QrCode;
	  }

	async getQrCode(userId: number){
		const player = await this.GetPlayerById(userId);
		const QrCode = await this.qrCodeServise.getFileById(player.qrcodeId)
		return QrCode
	}

	async setPlayerStatus(playerId : number, status : PlayerStatus){
		const player = await this.GetPlayerById(playerId)
		await this.update(player, {status: status})
	}

	async getSendPlayerApplication(sendPlayerId : number){
		const player = await this.GetPlayerById(sendPlayerId)
		const playerSendApplication = await this.playerApplication.getSendPlayerApplication(sendPlayerId)
		let players: PlayerEntity[] = []
		for (let i = 0; playerSendApplication[i]; i++) {
			const tmp_player = await this.GetPlayerById(playerSendApplication[i].getPlayerId)
			players.push(tmp_player)
		}
		return {player, players}
	}

	async getGetPlayerApplication(getPlayerId : number){
		const player = await this.GetPlayerById(getPlayerId)
		const playerGetApplication = await this.playerApplication.getGetPlayerApplication(getPlayerId)
		let players: PlayerEntity[] = []
		for (let i = 0; playerGetApplication[i]; i++) {
			const tmp_player = await this.GetPlayerById(playerGetApplication[i].sendPlayerId)
			players.push(tmp_player)
		}
		return {player, players}
	}

	async setApplication(sendPlayerId : number, getPlayerId: number): Promise<boolean> {
		if (sendPlayerId == getPlayerId){
			throw new HttpException('player who send application and player who get application are the same', HttpStatus.BAD_REQUEST);
		}
		if (!(await this.GetPlayerById(sendPlayerId))){
			throw new HttpException('player who send application not found', HttpStatus.BAD_REQUEST);
		}
		if (!(await this.GetPlayerById(getPlayerId))){
			throw new HttpException('player who get application not found', HttpStatus.BAD_REQUEST);
		}
		const application = await this.playerApplication.getGetAndSendPlayerApplication(getPlayerId, sendPlayerId)
		if (application){
			await this.playerApplication.setFriendStatus(getPlayerId, sendPlayerId)
		}
		else {
			await this.playerApplication.setSendPlayerApplication(sendPlayerId, getPlayerId)
		}
		return true
	}

	async removeApplication(sendPlayerId : number, getPlayerId: number): Promise<boolean>{
		if (sendPlayerId == getPlayerId){
			throw new HttpException('player who send application and player who get application are the same', HttpStatus.BAD_REQUEST);
		}
		if (!(await this.GetPlayerById(sendPlayerId))){
			throw new HttpException('player who send application not found', HttpStatus.BAD_REQUEST);
		}
		if (!(await this.GetPlayerById(getPlayerId))){
			throw new HttpException('player who get application not found', HttpStatus.BAD_REQUEST);
		}
		await this.playerApplication.deleteGetAndSendPlayerApplication(sendPlayerId, getPlayerId)
		return true
	}

	async getFriends(playerId: number){
		const player = await this.GetPlayerById(playerId)
		const friendsId = await this.playerApplication.getFriendsId(playerId)
		if (!friendsId){
			const friends = {}
			return ({player, friends})
		}
		const friends = await this.player_repository.findBy({
			id: In(friendsId)
		})

		return {player, friends}
	}
}
