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

@WebSocketGateway({
	cors: {
		origin: process.env.FRONT_URL,
	},
	namespace: 'chat'
})
export class ChatGateway {
	constructor(
		private readonly jwtService: JwtService
	) { }
	@WebSocketServer()
	server: Server;
	clients: Map<number, Socket[]>
	//utils
	async getTockenFromClient(client: Socket): Promise<string> {
		if (!client || !client.handshake || !client.handshake.headers)
			return null;
		const token = client.handshake.headers.authorization && client.handshake.headers.authorization.split(' ')[1];
		return token;
	}

	async initSrv() {
		if (!this.server) {
			this.server = new Server();
		}
	}

	async checkAuth(client: Socket): Promise<boolean> {
		const token: string = await this.getTockenFromClient(client);
		if (!token)
			return (false);
		try {
			const user = await this.jwtService.verify(token, { publicKey: process.env.JWT_ACCESS_KEY });
			console.log('user:\n', user);
			return true;
		}
		catch { return false; }
	}

	//events
	@SubscribeMessage('msgToServer')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any): Promise<any> {
		//check auth
		if (!await this.checkAuth(client)) {
			console.log('AUTH FAILED');
			return await client.disconnect();
		}
		//check body
		if (!body || !body.chat_id || !body.message)
			throw new BadRequestException('have no body or body is invalid')
		//check have permissions
		//add message to database
		//send msg to other
	}


	// afterInit(server: Server) {
	// 	this.logger.log('Init');
	// }

	// handleDisconnect(client: Socket) {
	// 	this.logger.log(`Client disconnected: ${client.id}`);
	// }

	@SubscribeMessage('connectToChat')
	async connectToChat(client: Socket, @MessageBody() body: any) {
		//check auth
		if (!await this.checkAuth(client)) {
			console.log('AUTH FAILED');
			return await client.disconnect();
		}
		//init server
		await this.initSrv();
		//check body
		if (!body || !body.chat_id)
			throw new BadRequestException('have no body or body is invalid');
		if (!await this.clients.has(body.chat_id))
			await this.clients.set(body.chat_id, []);
		await this.clients.get(body.chat_id).push(client);
		console.log('client has connected');
	}
}