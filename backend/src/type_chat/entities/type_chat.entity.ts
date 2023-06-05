import { Field, ObjectType, ID } from "@nestjs/graphql";
import { type } from "os";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity('type_chat')
export class Type_chat_entitiy {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field()
	@Column("char", {length: 100} )
	name: string
}
