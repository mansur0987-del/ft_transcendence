import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { PrimaryColumn } from "typeorm";
@Entity('private_messages')
export class Direct_R {
    @PrimaryColumn()
    chat_id: number;
    
    @Column({nullable: false })
    user_one: number;

	@Column({nullable: false })
	user_two: number;
}