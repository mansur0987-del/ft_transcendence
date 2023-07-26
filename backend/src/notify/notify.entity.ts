import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('notify')
export class Notify {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    initiator_id: number;

    @Column({ nullable: false })
    initiator_name: string;

    @Column({ nullable: false })
    who_id: number;

    @Column({ nullable: false })
    who_name: string;

    @Column({ nullable: false })
    created_at: Date;
}