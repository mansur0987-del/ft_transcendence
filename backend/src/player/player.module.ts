import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './service/player.service';
import { ControllerController } from './controller/controller.controller';
import { PlayerEntity } from './entities/player.entity';
import AvatarEntity from './entities/avatar.entity';
import AvatarService from './service/avatar.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    PlayerEntity,
    AvatarEntity
  ])],
  providers: [PlayerService, AvatarService],
  controllers: [ControllerController],
  exports: [PlayerService],
})
export class PlayerModule {}
