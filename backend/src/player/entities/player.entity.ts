import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('player')
export class PlayerEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { length: 100, nullable: false })
	name: string;

	@Column('varchar', { length: 100, nullable: false })
	name42: string;

	@Column({ type: 'bytea', nullable: true })
	image?: Buffer;

	@Column({default: false})
	isLogin: boolean

	@Column('varchar', { length: 100, nullable: true})
	twoFactorAuthenticationSecret: string

	@Column({default: false})
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({default: false})
	isLoginFactorAuthentication: boolean;

	@CreateDateColumn()
	create_at: Date

	@UpdateDateColumn()
	update_at: Date

	@DeleteDateColumn()
	delete_at: Date
}
