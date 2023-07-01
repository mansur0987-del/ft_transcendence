import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import Avatar from './avatar.entity';
import { PlayerApplicationEntity } from './playerApplication.entity';
import QrCode from "./qrcode.entity";

@Entity('player')
export class PlayerEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { length: 100, nullable: false })
	name: string;

	@Column('varchar', { length: 100, nullable: false })
	name42: string;

	@JoinColumn({ name: 'avatarId' })
	@OneToOne(
		() => Avatar,
		{
			nullable: true
		}
	)
	avatar?: Avatar;

	@Column({ nullable: true })
	avatarId?: number;

	@JoinColumn({ name: 'qrcodeId' })
	@OneToOne(
		() => QrCode,
		{
			nullable: true
		}
	)
	qrcode?: QrCode;

	@Column({ nullable: true })
	qrcodeId?: number;

	@Column({default: false})
	isLogin: boolean

	@Column('varchar', { length: 100, nullable: true})
	twoFactorAuthenticationSecret: string

	@Column({default: false})
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({default: false})
	isLoginFactorAuthentication: boolean;

	@Column({ nullable: false, default: 0 })
	status: number;

	@Column({default: false})
	isFirstGame: boolean;

	@Column({default: false})
	isFirstWin: boolean;

	@CreateDateColumn()
	create_at: Date

	@UpdateDateColumn()
	update_at: Date

	@DeleteDateColumn()
	delete_at: Date

	@OneToMany(() => PlayerApplicationEntity, (application) => application.sendPlayerId)
	@JoinColumn({name: "sendPlayerId"})
    sendApplication: PlayerApplicationEntity

	@OneToMany(() => PlayerApplicationEntity, (application) => application.getPlayerId)
	@JoinColumn({name: "getPlayerId"})
    getApplication: PlayerApplicationEntity
}
