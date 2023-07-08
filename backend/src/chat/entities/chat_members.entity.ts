import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PlayerEntity } from "src/player/entities/player.entity";
import { Chat } from "./chat.entity";

@Entity('chat_members')
export class chat_members {
    @Column({ nullable: false })
    chat_id: number; 
    
    @Column({ nullable: false })
    player_id: number;
    
    @Column({ nullable: false })
    owner_flg: boolean;

    @Column({ nullable: false })
    admin_flg: boolean;

    @Column({ nullable: false })
    banned_to_ts: Date

    @Column({ nullable: false })
    muted_to_ts: Date
}