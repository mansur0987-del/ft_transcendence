import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Get,
	NotFoundException,
	Post,
	Request,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@WebSocketGateway({
	cors: {
		origin: process.env.FRONT_URL,
	},
	namespace: 'chat'
})
export class ChatGateway {//implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	// @WebSocketServer()
	// server: Server;

	// private logger: Logger = new Logger('chatGateway');


	// @UseGuards(AuthGuard('jwt')) @Request() req: any, 
	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, body: any): void {
		console.log('get message to socket:\n', body);
		//this.server.emit('msgToClient', body);
	}

	// afterInit(server: Server) {
	// 	this.logger.log('Init');
	// }

	// handleDisconnect(client: Socket) {
	// 	this.logger.log(`Client disconnected: ${client.id}`);
	// }

	// handleConnection(client: Socket, ...args: any[]) {
	// 	this.logger.log(`Client connected: ${client.id}`);
	// }
}