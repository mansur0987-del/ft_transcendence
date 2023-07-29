import { BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Request,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { PlayerService } from '../service/player.service';
import { PlayerEntity } from '../entities/player.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'stream';
import { PlayerApplicationEntity } from '../entities/playerApplication.entity';
import { MatchService } from "../service/match.service";

@Controller('player')
export class ControllerController {
  constructor(
    private readonly player_service: PlayerService,
    private readonly matchService: MatchService 
    ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async GetALL(): Promise<PlayerEntity[]> {
    return await this.player_service.GetALL();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  async GetPlayerInfo(@Request() req): Promise<PlayerEntity> {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile/:id')
  async GetPlayerInfoById(@Param('id', ParseIntPipe) id: number): Promise<PlayerEntity> {
    return await this.player_service.GetPlayerById(id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/profile')
  async UpdatePlayerInfo(@Request() req: any, @Body() body: any): Promise<PlayerEntity> {
    if (!body.updateData){
      throw new BadRequestException('Validation failed');
    }
    await this.player_service.update(req.user, body.updateData)
    return await this.player_service.GetPlayerById(req.user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/profile/rename')
  async PostPlayerRename(@Request() req: any, @Body() body: any): Promise<PlayerEntity> {
    if (!body.newName){
      throw new BadRequestException('Validation failed');
    }
    if (await this.player_service.GetPlayerByName(body.newName)){
      throw new BadRequestException('There is already a player with that name');
    }
    await this.player_service.update(req.user, {name: body.newName})
    return this.player_service.GetPlayerById(req.user.id)
  }

  @Post('/avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(@Request() req: any, @UploadedFile(new ParseFilePipeBuilder()
    .addFileTypeValidator({fileType: '.(png|jpeg|jpg)',})
    .addMaxSizeValidator({maxSize: 1024 * 1024 * 4})
    .build({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY}),
  ) file: Express.Multer.File) {
    return await this.player_service.addAvatar(req.user.id, file.buffer, file.originalname);
  }

  @Get('/avatar')
  @UseGuards(AuthGuard('jwt'))
  async getAvatar(@Request() req: any, @Res({ passthrough: true }) res: Response): Promise<StreamableFile>{
    const avatar = await this.player_service.getAvatar(req.user.id)
    const stream = Readable.from(avatar.data);

    res.set({
      'Content-Disposition': `inline; filename="${avatar.filename}"`,
      'Content-Type': 'image'
    })

    return new StreamableFile(stream);
  }

  @Get('/avatar/:id')
  @UseGuards(AuthGuard('jwt'))
  async getAvatarId(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response): Promise<StreamableFile>{
    const avatar = await this.player_service.getAvatar(id)

    const stream = Readable.from(avatar.data);

    res.set({
      'Content-Disposition': `inline; filename="${avatar.filename}"`,
      'Content-Type': 'image'
    })

    return new StreamableFile(stream);
  }

  @Get('/profile/:id/avatar/')
  @UseGuards(AuthGuard('jwt'))
  async getPlayerIdAvatar(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response): Promise<StreamableFile>{
    const player = await this.player_service.GetPlayerById(id)
    const avatar = await this.player_service.getAvatar(player.avatarId)

    const stream = Readable.from(avatar.data);

    res.set({
      'Content-Disposition': `inline; filename="${avatar.filename}"`,
      'Content-Type': 'image'
    })

    return new StreamableFile(stream);
  }

  @Get('/sendapplycation/')
  @UseGuards(AuthGuard('jwt'))
  async getMyPlayerSendApplication(@Request() req: any) {
    return await this.player_service.getSendPlayerApplication(req.user.id)
  }

  @Get('/:id/sendapplycation/')
  async getPlayerSendApplication(@Param('id', ParseIntPipe) id: number){
    return await this.player_service.getSendPlayerApplication(id)
  }

  @Get('/getapplycation/')
  @UseGuards(AuthGuard('jwt'))
  async getMyPlayerGetApplication(@Request() req: any) {
    return await this.player_service.getGetPlayerApplication(req.user.id)
  }

  @Get('/:id/getapplycation/')
  async getPlayerGetApplication(@Param('id', ParseIntPipe) id: number){
    return await this.player_service.getGetPlayerApplication(id)
  }

  @Post('/sendapplycation/')
  @UseGuards(AuthGuard('jwt'))
  async setMyPlayerSendApplication(@Request() req: any, @Body() body: any) {
    return await this.player_service.setApplication(req.user.id, body.id)
  }

  @Post('/:id/sendapplycation/')
  async setPlayerSendApplication(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return await this.player_service.setApplication(id, body.id)
  }

  @Get('/friends/')
  @UseGuards(AuthGuard('jwt'))
  async getMyFriends(@Request() req: any) {
    return await this.player_service.getFriends(req.user.id)
  }

  @Get('/:id/friends/')
  async getFriends(@Param('id', ParseIntPipe) id: number){
    return await this.player_service.getFriends(id)
  }

  @Post('/removeapplycation/')
  @UseGuards(AuthGuard('jwt'))
  async removeMyPlayerSendApplication(@Request() req: any, @Body() body: any) {
    return await this.player_service.removeApplication(req.user.id, body.id)
  }

  @Post('/:id/removeapplycation/')
  async removePlayerSendApplication(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return await this.player_service.removeApplication(id, body.id)
  }

  @Get('/:id/stats')
  async getStatsPlayer(@Param('id', ParseIntPipe) id: number) {
    return (await this.matchService.getStats(id));
  }

  @Get('/:id/matchHist')
  async getMatchHistory(@Param('id', ParseIntPipe) id: number) {
    return (await this.matchService.getMatchHistory(id));
  }
}
