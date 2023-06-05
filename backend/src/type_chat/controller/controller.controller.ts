import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { type_chat_Service } from '../service/service.service';
import { Type_chat_entitiy } from '../entities/type_chat.entity';
import { Create_type_chat_input } from '../inputs/creat_type_chat.input';
import { Update_type_chat_input } from '../inputs/update_type_chat.input';

@Controller('Type_chat')
export class ControllerController {
	constructor(
		private readonly type_chat_service: type_chat_Service
	){}

	@Get()
	async get_type_chats() : Promise<Type_chat_entitiy[]> {
		return await this.type_chat_service.get_type_chats()
	}

	@Get(':id')
	async get_type_chat(@Param('id') id_str: string) : Promise<Type_chat_entitiy> {
		return await this.type_chat_service.get_type_chat(Number(id_str))
	}

	@Post('/')
	async create_type_chat(@Body('name') type_chat_input: Create_type_chat_input) : Promise<Type_chat_entitiy> {
		return await this.type_chat_service.create_type_chat(type_chat_input)
	}


}
