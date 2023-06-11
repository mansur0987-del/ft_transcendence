import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class Users_entity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({nullable: false} )
	username: string

	@Column({nullable: false })
	password: string

	@Column({nullable: false, default: "example@mail.com"})
	email: string

	@Column({nullable: true})
	twoFactorAuthenticationSecret: string

	@Column({default: false})
	isTwoFactorAuthenticationEnabled: boolean;

	@CreateDateColumn()
	create_at: Date

	@UpdateDateColumn()
	update_at: Date

	@DeleteDateColumn()
	delete_at: Date
}
