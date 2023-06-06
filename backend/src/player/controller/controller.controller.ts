import { Controller, Get, Param } from '@nestjs/common';
import { PlayerService } from '../service/player.service';
import { Player_entitiy } from '../entities/player.entity';

@Controller('player')
export class ControllerController {
	constructor(
		private readonly player_service: PlayerService
	) {}

	@Get()
	async GetALL(): Promise<Player_entitiy[]>{
		return await this.player_service.GetALL()
	}

	@Get(':id')
	async Get_player(@Param('id') id_str: string): Promise<Player_entitiy>{
		return await this.player_service.Get_player(Number(id_str))
	}
}
