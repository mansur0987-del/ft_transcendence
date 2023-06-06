import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('player')
export class Player_entitiy {
	@PrimaryGeneratedColumn()
	id: number

	@Column("varchar", {length: 100, nullable: false} )
	name: string

	@Column("varchar", {length: 100, nullable: false} )
	name_42: string

	@Column("varchar", {length: 100, nullable: false} )
	password: string

	@Column({type: "bytea", nullable: true })
	image?: Buffer

	@Column("boolean")
	online: boolean

	@Column("boolean")
	admin: boolean
}
