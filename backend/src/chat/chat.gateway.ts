import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
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
import { JwtService } from '@nestjs/jwt';
import { ChatController } from "./chat.controller";
import { PlayerService } from "src/player/service/player.service";

@WebSocketGateway({
	cors: {
		origin: process.env.FRONT_URL,
	},
	namespace: 'chat'
})
export class ChatGateway {
	constructor(
		private readonly jwtService: JwtService,
		private readonly chContr: ChatController,
		private readonly plService: PlayerService
	) { }
	@WebSocketServer()
	server: Server;
	clients: Map<number, Map<number, Socket>>;
	//utils
	async getTockenFromClient(client: Socket): Promise<string> {
		if (!client || !client.handshake || !client.handshake.headers)
			return null;
		const token = client.request.headers.authorization && client.request.headers.authorization.split(' ')[1];
		return token;
	}

	async initSrv() {
		if (!this.server) {
			this.server = new Server();
		}
		if (!this.clients)
			this.clients = new Map<number, Map<number, Socket>>;
	}

	async emitToOther(chat_id: number, msg: string, sender_name: string) {
		const toSend = this.clients.get(chat_id);
		toSend.forEach(client => {
			let res = client.emit('msgFromServer', {sender_name: sender_name, message: msg});
			console.log('resEmit =', res);
		});
	}

	async checkAuth(client: Socket): Promise<string> {
		const token: string = await this.getTockenFromClient(client);
		if (!token)
			return (null);
		try {
			const user = await this.jwtService.verify(token, { publicKey: process.env.JWT_ACCESS_KEY });
			console.log('user:\n', user);
			return user.name42;
		}
		catch { return null; }
	}

	// //events
	@SubscribeMessage('msgToServer')
	async newMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any): Promise<any> {
		await this.connectToChat(client, body);
		//check body
		if (!body || !body.chat_id || !body.message)
			throw new BadRequestException('have no body or body is invalid')	
		const name42 = await this.checkAuth(client);
		if (!name42)
			throw new ForbiddenException('AUTH FAILED');
		const user = await this.plService.GetPlayerByName42(name42);
		if (!user)
			throw new NotFoundException('user not found')
		//add message to database
		this.chContr.sendMessage({user: {id: user.id}}, body);
		//send msg to other
		this.emitToOther(body.chat_id, body.message, user.name);
	}

	@SubscribeMessage('connectToChat')
	async connectToChat(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		//check auth
		const name42 = await this.checkAuth(client);
		if (!name42) {
			console.log('\nAUTH FAILED\n');
			throw new ForbiddenException('AUTH FAILED');
		}
		console.log(name42, 'AUTH SUCCESS\n');
		//init server	
		await this.initSrv();
		//check body
		if (!body || !body.chat_id)
			throw new BadRequestException('have no body or body is invalid');
		const user = await this.plService.GetPlayerByName42(name42);
		if (!user)
			throw new NotFoundException('user whith name ' + name42 + ' not found');
		if (!this.clients.has(body.chat_id))
			this.clients.set(body.chat_id, new Map<number, Socket>);
		this.clients.get(body.chat_id).set(user.id, client);
		console.log('\nclient ' + name42 + ' has been connected\n');
	}

	@SubscribeMessage('disconnectChat')
	async disconnectChat(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		//check body
		if (!body || !body.chat_id)
			throw new BadRequestException('have no body or body is invalid');
		if (!this.clients.has(body.chat_id))
			throw new NotFoundException('have no this chat');
		const name42 = await this.checkAuth(client);
		if (!name42)
			client.disconnect(true);
		const user = await this.plService.GetPlayerByName42(name42);
		if (!user)
			throw new NotFoundException('user whith name ' + name42 + ' not found');
		let chatClients = this.clients.get(body.chat_id);
		if (!chatClients)
			throw new NotFoundException('channel not found');
		if (!chatClients.has(user.id))
			throw new BadRequestException('client ' + name42 + ' already disconnected')
		chatClients.delete(user.id);
		console.log('\nclient ' + name42 + ' has been disconnected\n');
	}
}