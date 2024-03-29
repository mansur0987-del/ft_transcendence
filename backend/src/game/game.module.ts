import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { GameService } from './services/game.service';
import { RoomService } from './services/room.service';
import { GameController } from './controllers/game.controller';
import { PlayerModule } from 'src/player/player.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from '../auth/service/auth.service';
import { MatchService } from '../player/service/match.service';
import { MatchEntity } from '../player/entities/match.entity';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([MatchEntity]),
    AuthModule,
    PlayerModule,
    HttpModule,
  ],
  controllers: [GameController],
  providers: [GameService, RoomService, GameGateway, MatchService, AuthService],
  exports: [RoomService]
})
export class GameModule {}
