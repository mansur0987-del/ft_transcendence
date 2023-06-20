import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './service/player.service';
import { ControllerController } from './controller/controller.controller';
import { PlayerEntity } from './entities/player.entity';
import AvatarEntity from './entities/avatar.entity';
import AvatarService from './service/avatar.service';
import { PlayerApplicationEntity } from './entities/playerApplication.entity';
import PlayerApplcationService from './service/playerApplication.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    PlayerEntity,
    AvatarEntity,
    PlayerApplicationEntity
  ])],
  providers: [PlayerService, AvatarService, PlayerApplcationService],
  controllers: [ControllerController],
  exports: [PlayerService],
})
export class PlayerModule {}
