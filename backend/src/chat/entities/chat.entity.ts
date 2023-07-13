import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('chat')
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    chat_name: string;

    @Column({ nullable: false })
    isPrivate: boolean;

    @Column({ nullable: false })
    isDirect: boolean;

    @Column({ nullable: false })
    have_password: boolean;

    @Column({ nullable: true })
    password: string;
}