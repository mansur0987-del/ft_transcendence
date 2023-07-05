import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Socket } from 'socket.io';
import { MatchEntity } from 'src/player/entities/match.entity';
import { MatchService } from 'src/user/services/match.service';
import { PlayerService } from 'src/player/service/player.service';
import {
  GameOptions,
  Plan,
  Mode,
  Room,
  State,
  Player,
  Mode,
} from '../interfaces';
import { GameService } from './game.service';

@Injectable()
export class RoomService {
  constructor(
    private readonly game: GameService,
    private readonly userService: PlayerService,
    private readonly matchService: MatchService,
  ) {}

  //..
}
