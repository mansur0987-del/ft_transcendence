import { Entity, Column, PrimaryGeneratedColumn, Timestamp, CreateDateColumn } from 'typeorm';
import { PlayerEntity } from '../../player/entities/player.entity';
import { UpdateGameDTO } from '../dto/update-game.dto';

export enum GameState {
  STARTING = 'starting',
  RUNNING = 'running',
  ENDED = 'ended',
  PAUSED = 'paused',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  player1: PlayerEntity;

  @Column()
  player2: PlayerEntity;

  @Column({ default: '' })
  result: string;

  @Column()
  player1Score: number;

  @Column()
  player2Score: number;
  
  @Column()
  gameState: GameState;

  @CreateDateColumn()
  createdAt: Date;
}
