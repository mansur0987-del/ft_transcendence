import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './entities/game.entity';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { RoomService } from "./services/room.service";
import { GameController } from "./controllers/game.controller";
import { PlayerModule } from "src/player/player.module";
import { AuthModule } from "src/auth/auth.module";
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule, PlayerModule, TypeOrmModule.forFeature([GameEntity])],
  controllers: [GameController],
  providers: [GameGateway, GameService, RoomService],
})
export class GameModule {}
