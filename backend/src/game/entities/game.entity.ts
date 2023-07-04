import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  player1: number;

  @Column()
  player2: number;

  @Column()
  result: string;

  @CreateDateColumn()
  createdAT: Date;
}
