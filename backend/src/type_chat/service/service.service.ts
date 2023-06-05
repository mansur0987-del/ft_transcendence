import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Type_chat_entitiy } from '../entities/type_chat.entity';
import { Repository } from 'typeorm';
import { Create_type_chat_input } from '../inputs/creat_type_chat.input';
import { Update_type_chat_input } from '../inputs/update_type_chat.input';

@Injectable()
export class type_chat_Service {
	constructor (
		@InjectRepository(Type_chat_entitiy)
		private readonly type_chat_repository: Repository<Type_chat_entitiy>
	){}

	async create_type_chat(new_type_chat: Create_type_chat_input): Promise<Type_chat_entitiy>{
		return await this.type_chat_repository.save({...new_type_chat})
	}

	async get_type_chat(get_id: number): Promise<Type_chat_entitiy>{
		return await this.type_chat_repository.findOne({where: {
			id: get_id
		  }})
	}

	async get_type_chats(): Promise<Type_chat_entitiy[]>{
		const chat = await this.type_chat_repository.find()
		if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND)

		return chat
	}

	async remove_type_chat(id: number): Promise<number>{
		await this.type_chat_repository.delete({id})
		return id
	}

	async update_type_chat(update_type_chat: Update_type_chat_input): Promise<Type_chat_entitiy>{
		await this.type_chat_repository.update({id: update_type_chat.id}, {...update_type_chat})
		return await this.get_type_chat(update_type_chat.id)
	}
}
