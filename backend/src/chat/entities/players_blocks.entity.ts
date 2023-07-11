import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('player_blocks')
export class Player_blocks {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false })
    player_id: number; 
    
    @Column({nullable: false })
    blocked_player_id: number;

    @Column({nullable: false})
    isBlocked: boolean
}