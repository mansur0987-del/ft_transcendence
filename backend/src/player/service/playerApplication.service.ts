import { Injectable } from "@nestjs/common";
import { PlayerApplicationEntity } from "../entities/playerApplication.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationStatus } from "../enums/applicationStatus.enum";

@Injectable()
class PlayerApplcationService {
	constructor(
		@InjectRepository(PlayerApplicationEntity)
		private playerApplicationRepository: Repository<PlayerApplicationEntity>
		){}

	async getSendPlayerApplication(sendPlayerId: number): Promise<PlayerApplicationEntity[]>{
		return await this.playerApplicationRepository.find({
			where: {
				sendPlayerId: sendPlayerId,
				status: 0
			}
			})
	}

	async getGetPlayerApplication(getPlayerId: number): Promise<PlayerApplicationEntity[]>{
		return await this.playerApplicationRepository.find({
			where: {
				getPlayerId: getPlayerId,
				status: 0
			}
			})
	}

	async getGetAndSendPlayerApplication(sendPlayerId: number, getPlayerId: number): Promise<PlayerApplicationEntity>{
		return await this.playerApplicationRepository.findOne({
			where: {
				sendPlayerId: sendPlayerId,
				getPlayerId: getPlayerId
			}
		})
	}

	async setSendPlayerApplication(sendPlayerId: number, getPlayerId: number): Promise<PlayerApplicationEntity>{
		const getAndSendPlayerApplication = await this.getGetAndSendPlayerApplication(sendPlayerId, getPlayerId)
		if (getAndSendPlayerApplication){
			return getAndSendPlayerApplication
		}
		return await this.playerApplicationRepository.save({
			sendPlayerId: sendPlayerId,
			getPlayerId: getPlayerId
		})
	}

	async deleteGetAndSendPlayerApplication(sendPlayerId: number, getPlayerId: number): Promise<void>{
		const Application_1 = await this.getGetAndSendPlayerApplication(sendPlayerId, getPlayerId)
		const Application_2 = await this.getGetAndSendPlayerApplication(getPlayerId, sendPlayerId)
		if (Application_1){
			await this.playerApplicationRepository.remove(Application_1)
		}
		else if (Application_2){
			await this.playerApplicationRepository.remove(Application_2)
		}
	}

	async setFriendStatus(sendPlayerId: number, getPlayerId: number): Promise<PlayerApplicationEntity>{
		const getAndSendPlayerApplication = await this.getGetAndSendPlayerApplication(sendPlayerId, getPlayerId)
		if (getAndSendPlayerApplication.status == ApplicationStatus.FRIEND)
			return getAndSendPlayerApplication

		await this.playerApplicationRepository.update(getAndSendPlayerApplication.id, {
			status: ApplicationStatus.FRIEND})

		return await this.getGetAndSendPlayerApplication(sendPlayerId, getPlayerId)
	}

	async getFriendsId(playerId: number): Promise<number[]>{
		const FriendsStruct = await this.playerApplicationRepository.find({
			where:[
				{
					status: ApplicationStatus.FRIEND,
					sendPlayerId: playerId,
				},
				{
					status: ApplicationStatus.FRIEND,
					getPlayerId: playerId,
				}
			]
		})
		let friendsId: number[] = [];
		for (let index = 0; index < FriendsStruct.length; index++) {
			if (FriendsStruct[index].sendPlayerId != playerId){
				friendsId.push(FriendsStruct[index].sendPlayerId)
			}
			if (FriendsStruct[index].getPlayerId != playerId){
				friendsId.push(FriendsStruct[index].getPlayerId)
			}
		}
		return friendsId
	}
}

export default PlayerApplcationService;
