import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './service/player.service';
import { ControllerController } from './controller/controller.controller';
import { Player_entitiy } from './entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Player_entitiy])
    ],
  providers: [PlayerService],
  controllers: [ControllerController]
})
export class PlayerModule {}
