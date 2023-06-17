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

@Controller('player')
export class ControllerController {
  constructor(private readonly player_service: PlayerService) {}

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
  async GetPlayerInfoById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.player_service.GetPlayerById(id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/profile')
  async UpdatePlayerInfo(@Request() req: any, @Body() body: any): Promise<any> {
    if (!body.updateData){
      throw new BadRequestException('Validation failed');
    }
    await this.player_service.update(req.user, body.updateData)
    return await this.player_service.GetPlayerById(req.user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/profile/rename')
  async PostPlayerRename(@Request() req: any, @Body() body: any): Promise<any> {
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

  //@Get('photo')
  //async GetPhoto(): Promise<any> {
  //  const player = await this.player_service.GetPlayerById(1)
  //  return player.image
  //}

  //@Post('photo')
  //@UseInterceptors(FileInterceptor('file'))
  //async PostPhoto(
  //  @UploadedFile(new ParseFilePipeBuilder()
  //  .addFileTypeValidator({fileType: '.(png|jpeg|jpg)',})
  //  .addMaxSizeValidator({maxSize: 1024 * 1024 * 4})
  //  .build({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY}),
  //  ) file: Express.Multer.File,
  //  @Res() res : Response) : Promise<any> {
  //    res.set()
  //    console.log('file')
  //    console.log(file)
  //    return {
  //      file: file.buffer.toString(),
  //    }
  //  }
}
