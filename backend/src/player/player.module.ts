import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './service/player.service';
import { ControllerController } from './controller/controller.controller';
import { PlayerEntity } from './entities/player.entity';
import AvatarEntity from './entities/avatar.entity';
import AvatarService from './service/avatar.service';
import { PlayerApplicationEntity } from './entities/playerApplication.entity';
import PlayerApplcationService from './service/playerApplication.service';
import QrCodeService from "./service/qrcode.service";
import QrCode from "./entities/qrcode.entity";
import { MatchService } from './service/match.service';
import { MatchEntity } from "./entities/match.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
    PlayerEntity,
    MatchEntity,
    AvatarEntity,
    PlayerApplicationEntity,
    QrCode
  ])],
  providers: [PlayerService, AvatarService, PlayerApplcationService, QrCodeService, MatchService],
  controllers: [ControllerController],
  exports: [PlayerService, MatchService],
})
export class PlayerModule {}
