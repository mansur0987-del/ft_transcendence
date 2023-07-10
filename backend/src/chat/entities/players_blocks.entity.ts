import {Column, Entity } from 'typeorm'

@Entity('player_blocks')
export class Player_blocks {
    @Column({nullable: false })
    player_id: number; 
    
    @Column({nullable: false })
    blocked_player_id: number;
}