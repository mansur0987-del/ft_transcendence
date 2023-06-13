import {Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('achievement')
export class Achievement {
    @PrimaryGeneratedColumn()
    id: number;
    @Column('varchar', {length: 100, nullable: false })
    name: string;
}
