import { Column, Entity } from 'typeorm';

@Entity()
export class PlayersGame {
  @Column('int', { primary: true })
  player_id: number;

  @Column('int', { primary: true })
  game_id: number;

  @Column('boolean', { default: false })
  admin: boolean;
}
