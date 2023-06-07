import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('player')
export class Player_entitiy {
	@PrimaryGeneratedColumn()
	id: number

	@Column("varchar", {length: 100, nullable: false} )
	name: string

	@Column({type: "bytea", nullable: true })
	image?: Buffer

	@Column("boolean", {default: false})
	online: boolean

	@Column("boolean", {default: false})
	admin: boolean
}
