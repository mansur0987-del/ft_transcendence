//import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
//import { type_chat_Service } from '../service/service.service';
//import { Type_chat_entitiy } from '../entities/type_chat.entity';
//import { Create_type_chat_input } from '../inputs/creat_type_chat.input';
//import { Update_type_chat_input } from '../inputs/update_type_chat.input';

//@Resolver('Type_chat')
//export class ResolverResolver {
//	constructor(
//		private readonly type_chat_service: type_chat_Service
//	){}

//	@Mutation(() => Type_chat_entitiy)
//	async create_type_chat(@Args('create_type_chat') create_type_chat_input: Create_type_chat_input): Promise<Type_chat_entitiy>{
//		return await this.type_chat_service.create_type_chat(create_type_chat_input)
//	}

//	@Mutation(() => Type_chat_entitiy)
//	async update_type_chat (@Args('update_type_chat') update_type_chat_input: Update_type_chat_input): Promise<Type_chat_entitiy>{
//		return await this.type_chat_service.update_type_chat(update_type_chat_input)
//	}

//	@Mutation(() => Number)
//	async remove_type_chat(@Args('id') id: number) : Promise<Number> {
//		await this.type_chat_service.remove_type_chat(id)
//		return id
//	}

//	@Query(() => Type_chat_entitiy)
//	async get_type_chat(@Args('id') id: number) : Promise<Type_chat_entitiy> {
//		return await this.type_chat_service.get_type_chat(id)
//	}

//	@Query(() => [Type_chat_entitiy])
//	async get_type_chats() : Promise<Type_chat_entitiy[]> {
//		return await this.type_chat_service.get_type_chats()
//	}
//}
