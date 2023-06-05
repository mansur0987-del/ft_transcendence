import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class Update_type_chat_input{
	@Field(() => ID)
	id: number

	@Field()
	name: string
}
