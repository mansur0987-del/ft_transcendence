import { Column, Entity } from 'typeorm';

@Entity('chat_members')
export class Chat_members {
    @Column({ nullable: false })
    chat_id: number; 
    
    @Column({ nullable: false })
    player_id: number;
    
    @Column({ nullable: false })
    owner_flg: boolean;

    @Column({ nullable: false })
    admin_flg: boolean;

    @Column({ nullable: false })
    member_flg: boolean;

    @Column({ nullable: false })
    banned_to_ts: Date

    @Column({ nullable: false })
    muted_to_ts: Date
}