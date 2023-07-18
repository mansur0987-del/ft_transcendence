import {
	SubscribeMessage,
	WebSocketGateway,
	// OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
	BadRequestException,
	ConsoleLogger,
	ForbiddenException,
	NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatController } from "./chat.controller";
import { PlayerService } from "src/player/service/player.service";
import { PlayerBlocksService } from "./services/players_blocks.service";

@WebSocketGateway({
	cors: {
		origin: process.env.FRONT_URL,
	},
	namespace: 'chat'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
	constructor(
		private readonly jwtService: JwtService,
		private readonly chContr: ChatController,
		private readonly plService: PlayerService,
		private readonly plBlocks: PlayerBlocksService
	) { }
	@WebSocketServer()
	server: Server;
	clients: Map<number, Map<string, any>>; //<chat_id: <sock_id: Socket>>
	connectedClients: Map<string, any>; // <sock_id: Socket>
	//utils
	async getTockenFromClient(client: Socket): Promise<string> {
		if (!client || !client.handshake || !client.handshake.headers)
			return null;
		const token = client.request.headers.authorization && client.request.headers.authorization.split(' ')[1];
		return token;
	}

	async errorMessage(response: any, client: Socket) {
		console.log('exception:\n' + response);
		client.emit('msgFromServer', {
			error: (response?.reason + (response.daysExpire ? (': for a ' + response.daysExpire) : ''))
		})
	}

	async initSrv() {
		if (!this.server)
			this.server = new Server();
		if (!this.clients)
			this.clients = new Map<number, Map<string, any>>;
		if (!this.connectedClients)
			this.connectedClients = new Map<string, any>;
	}

	async emitToOther(chat_id: number, msg: string, sender_id: number, sender_name: string) {
		try {
			const toSend = this.clients.get(chat_id);
			toSend.forEach(async client => {
				console.log('user in db', client.user_id_in_db);
				console.log('sender_id', sender_id);
				if (!await this.plBlocks.isBlocked(client.user_id_in_db, sender_id)) {
					let res = await client.emit('msgFromServer', {sender_name: sender_name, message: msg});
					console.log('resEmit =', res);
				}
			});
		}
		catch (e) { console.log('EXCEPTION:\n' + e) }
	}

	async checkAuth(client: Socket): Promise<string> {
		const token: string = await this.getTockenFromClient(client);
		if (!token)
			return (null);
		try {
			const user = await this.jwtService.verify(token, { publicKey: process.env.JWT_ACCESS_KEY });
			return user.name42;
		}
		catch { return null; }
	}

	@SubscribeMessage('signal')
	async signalToReload(@ConnectedSocket() client: Socket, @MessageBody() body: any){
		console.log('\nsignal started\n')
		try {
			console.log('\this.connectedClients size =', this.connectedClients.size);
			this.connectedClients.forEach(element => {
				console.log('res signal emit =', element.emit('callBack', body));
			});
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('signalUsers')
	async signalToReloadUsers(@ConnectedSocket() client: Socket, @MessageBody() body: any){
		console.log('\nsignalUsers started\n')
		try {
			console.log('\this.connectedClients size in signal USers =', this.connectedClients.size);
			this.connectedClients.forEach(element => {
				console.log('res signal users emit =', element.emit('callBackUsers', body));
			});
		}
		catch (e) { this.errorMessage(e, client); }
	}

	//events
	@SubscribeMessage('msgToServer')
	async newMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any): Promise<any> {
		//try {
			await this.connectToChat(client, body);
			//add message to database
			const who = this.connectedClients.get(client.id);
			if (!who)
				throw new ForbiddenException('client not connected to socket');
			await this.chContr.sendMessage({user: {id: who.user_id_in_db}}, body);
			this.emitToOther(body.chat_id, body.message, who.user_id_in_db, who.user_name_in_db);
		}
		catch (e) { this.errorMessage(e.response, client); }
	}

	@SubscribeMessage('connectToChat')
	async connectToChat(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			//check auth
			const who = this.connectedClients.get(client.id);
			if (!who)
				throw new ForbiddenException('unknown socket connection');
			//check body
			if (!body || !body.chat_id)
				throw new BadRequestException('have no body or body is invalid');
			if (!this.clients.has(body.chat_id))
				this.clients.set(body.chat_id, new Map<string, any>);
			if (this.clients.get(body.chat_id).has(client.id))
				return;
			this.clients.get(body.chat_id).set(client.id, who);
			console.log('\nclient ' + (who ? who.user_name42_in_db : 'unknown') + ' has been connected to chat\n');
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('disconnectChat')
	async disconnectChat(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			//check body
			if (!body || !body.chat_id)
				throw new BadRequestException('have no body or body is invalid');
			if (!this.clients.has(body.chat_id))
				throw new NotFoundException('have no this channel in Map');
			const who = this.connectedClients.get(client.id);
			if (!who)
				throw new NotFoundException('user not found in connected clients');
			let chatClients = this.clients.get(body.chat_id);
			if (!chatClients)
				throw new NotFoundException('channel not found');
			if (!chatClients.has(client.id))
				throw new BadRequestException('client ' + who ? who.user_name42_in_db : 'unknown' + ' not in this channel')
			chatClients.delete(client.id);
			console.log('\nclient ' + (who ? who.user_name42_in_db : 'unknown') + ' has been disconnected\n');
		}
		catch (e) { this.errorMessage(e, client); }
	}

	async handleConnection(@ConnectedSocket() client: any) {
		try {
			this.initSrv();
			const name42 = await this.checkAuth(client);
			if (!name42) {
				client.disconnect();
				return;
			}
			const user = await this.plService.GetPlayerByName42(name42);
			if (!user) {
				client.disconnect();
				throw new ForbiddenException('user ' + name42 + ' not in DB');
			}
			console.log('\n' + name42 + ' connected\n');
			client.user_id_in_db = user.id;
			client.user_name42_in_db = name42;
			client.user_name_in_db = user.name;
			this.connectedClients.set(client.id, client);
		}
		catch (e) { this.errorMessage(e, client); }
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		try {
			const userInConnected: any = this.connectedClients.get(client.id);
			this.clients.forEach(chat => {
				if (chat.has(client.id))
					chat.delete(client.id);
			})
			this.connectedClients.delete(client.id);
			console.log('\nclient ' + (userInConnected ? userInConnected.name42 : 'unknown') + ' disconnected\n');
		}
		catch (e) { this.errorMessage(e, client); }
	}
}
