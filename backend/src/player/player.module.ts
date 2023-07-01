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

@Module({
  imports: [TypeOrmModule.forFeature([
    PlayerEntity,
    AvatarEntity,
    PlayerApplicationEntity,
    QrCode
  ])],
  providers: [PlayerService, AvatarService, PlayerApplcationService, QrCodeService],
  controllers: [ControllerController],
  exports: [PlayerService],
})
export class PlayerModule {}
