import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('chat')
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({nullable: false})
    chat_name: string;

    @Column({nullable: false })
    type_id: number; // 0 - private 1 - public
    
    @Column({nullable: false })
    have_password: boolean;

    @Column({length: 100 })
    password: string; //CRYPTED
}