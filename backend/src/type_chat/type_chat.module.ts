import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type_chat_entitiy } from './entities/type_chat.entity'
import { type_chat_Service } from './service/service.service';
import { ControllerController } from './controller/controller.controller';


@Module({
	imports: [
		TypeOrmModule.forFeature([
			Type_chat_entitiy
		])
	],
	providers: [type_chat_Service],
	controllers: [ControllerController]
})
export class type_chat_modul {}
