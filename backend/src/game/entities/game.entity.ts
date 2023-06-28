import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { PlayerEntity } from '../../player/entities/player.entity';

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

  @ManyToOne(() => PlayerEntity, user => user.games)
  player1: PlayerEntity;

  @ManyToOne(() => PlayerEntity, user => user.games)
  player2: PlayerEntity;

  @Column({ nullable: true })
  score1: number;

  @Column({ nullable: true })
  score2: number;

  @Field()
  @Column({
    type: 'enum',
    enum: GameState,
    default: GameState.STARTING,
  })
  state: GameState;

//   @Column({ default: 'in progress' })
//   status: string;

  @Column()
  started_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  finished_at: Date;  
}
