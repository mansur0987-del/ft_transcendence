import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { PlayerService } from '../service/player.service';
import { PlayerEntity } from '../entities/player.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('player')
export class ControllerController {
  constructor(private readonly player_service: PlayerService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  async GetALL(): Promise<PlayerEntity[]> {
    return await this.player_service.GetALL();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async GetPlayerInfo(@Request() req): Promise<PlayerEntity> {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async PostPlayerInfo(@Request() req: any, @Body() body: any): Promise<any> {
    if (body.method == 'get'){
      if (body.playerName)
        return {result: true, data: await this.player_service.GetPlayerByName(body.name)}
      else if (body.playerId)
        return {result: true, data: await this.player_service.GetPlayerById(body.playerId)}
      else
        return ({result: false, msg: 'Wrong body'})
    }
    if (body.method == 'update'){
      if (!body.updateData){
        return ({result: false, msg: 'Wrong body'})
      }
      return ({result: true, data: await this.player_service.update(req.user, body.updateData)})
    }
    return ({result: false, msg: 'Wrong body'})
  }
  //@Post()
  //async GetPlayerById(@Body() body: any): Promise<PlayerEntity> {
  //  return await this.player_service.GetPlayerById(Number(id_str));
  //}
}
