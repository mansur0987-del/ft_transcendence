import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'


@Entity('chat_messages')
export class Chat_messages {
    @PrimaryGeneratedColumn()
    id: number; //message id
    
    @Column({nullable: false})
    chat_id: number; // id of entity chat

	@Column({nullable: false})
    player_id: number; // id of sender
    
    @Column({nullable: false, length: 10000})
    message: string; //message content

	@Column({ nullable: false })
    sent_ts: Date //sent timestamp
}