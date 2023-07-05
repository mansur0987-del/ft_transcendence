import { Room } from './room.interface';
import { Mode } from './mode.interface';
import { Socket } from 'socket.io';
import { PlayerEntity } from 'src/player/entities/player.entity';

export interface Player {
  socket: Socket;
  player: PlayerEntity;
  room: Room;
  mode: Mode;
  paddle: number;
  score: number;
}