import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlayerEntity } from './player.entity';


@Entity()
export class MatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { array: true, default: [] })
  score: number[];

  @Column({ type: 'timestamptz' })
  date: Date;

  @ManyToOne(() => PlayerEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  winner: PlayerEntity;

  @ManyToOne(() => PlayerEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  loser: PlayerEntity;
}