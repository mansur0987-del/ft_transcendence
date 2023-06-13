import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export class Chat {
    @PrimaryGeneratedColumn()
    id: number; 
    
    @Column({nullable: false })
    type_id: number;
    
    @Column()
    have_password: boolean;

    @Column({length: 100 })
    password: string;
}
