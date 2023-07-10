import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('private_messages')
export class Private_messages {
    @PrimaryGeneratedColumn()
    id: number; 
    
    @Column({nullable: false })
    sender_id: number;

	@Column({nullable: false })
	recipient_id: number;
    
	@Column({nullable: false, length: 10000})
    message: string; //message content

	@Column({ nullable: false })
    sent_ts: Date //sent timestamp
}