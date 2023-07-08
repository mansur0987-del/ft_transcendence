import { Entity, Column, PrimaryGeneratedColumn, Timestamp, CreateDateColumn } from 'typeorm';
import { PlayerEntity } from '../../player/entities/player.entity';
import { ValidateNested } from '@nestjs/class-validator';

export enum GameState {
  STARTING = 'starting',
  RUNNING = 'running',
  ENDED = 'ended',
  PAUSED = 'paused',
}

@Entity()
export class GameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  win_player_id: number;

  @Column()
  player1Score: number;

  @Column()
  player2Score: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column()
  @ValidateNested()
  player1: PlayerEntity;

  @Column()
  @ValidateNested()
  player2: PlayerEntity;
  
  @Column({type: 'enum', enum: GameState})
  gameState: GameState;
}
