import { Controller, Get, Param } from '@nestjs/common';
import { PlayerService } from '../service/player.service';
import { PlayerEntity } from '../entities/player.entity';

@Controller('player')
export class ControllerController {
  constructor(private readonly player_service: PlayerService) {}

  @Get()
  async GetALL(): Promise<PlayerEntity[]> {
    return await this.player_service.GetALL();
  }

  @Get(':id')
  async GetPlayerById(@Param('id') id_str: string): Promise<PlayerEntity> {
    return await this.player_service.GetPlayerById(Number(id_str));
  }
}
