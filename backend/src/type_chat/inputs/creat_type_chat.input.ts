import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class Create_type_chat_input{
	@Field()
	name: string
}
