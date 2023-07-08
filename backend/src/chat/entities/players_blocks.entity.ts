import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export class Chat {
    @Column({nullable: false })
    player_id: number; 
    
    @Column({nullable: false })
    blocked_player_id: number;
}