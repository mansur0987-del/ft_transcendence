import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
	BadRequestException,
	ForbiddenException,
	NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlayerService } from "src/player/service/player.service";

@WebSocketGateway({
	cors: {
		origin: process.env.FRONT_URL,
	},
	namespace: 'invite'
})
export class notifyGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly jwtService: JwtService,
		private readonly plService: PlayerService,
	) { }
	@WebSocketServer()
	server: Server;
	allConnected: Map<string, any>;
	invites: { initiator: any, who: any }[];
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
			error: (response.reason)
		})
	}

	async initSrv() {
		if (!this.server)
			this.server = new Server();
		if (!this.allConnected)
			this.allConnected = new Map<string, any>();
		if (!this.invites)
			this.invites = [];
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

	async findByName(name: string): Promise<any> {
		let who: any = null;
		this.allConnected.forEach((element) => {
			if (element.user_name_in_db == name) {
				who = element;
				return;
			}
		});
		return who;
	}

	//events
	@SubscribeMessage('invitePlayerInitiator')
	async invitePlayerInitiator(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			console.log('body in invitePlayerInitiator:\n', body);
			if (!body || !body.name)
				throw new BadRequestException('have no body or player name');
			const initiator = await this.allConnected.get(client.id);
			console.log('MAP in invitePlayerInitiator = ', this.allConnected);
			const who = await this.findByName(body.name);
			console.log('who in invitePlayerInitiator = ', who);
			if (!who)
				throw new NotFoundException(body.name + ' not avaible rigth now');
			this.invites.push(initiator, who);
			console.log('initiator: ', initiator.user_name_in_db);
			console.log('res invitePlayerInitiator emit =', who.emit('GetInvite', { name: initiator.user_name_in_db }));
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('cancelInviteInitiator')
	async cancelInviteInitiator(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			if (!body || !body.name)
				throw new BadRequestException('have no body or player name');
			const initiator = await this.allConnected.get(client.id);
			const who = await this.findByName(body.name);
			if (!who)
				throw new NotFoundException(body.name + ' not avaible rigth now');
			for (let i = 0; i < this.invites.length; i++) {
				if (this.invites[i].initiator.id == client.id)
					this.invites.slice(i);
			}
			console.log('res cancelInviteInitiator emit =', who.emit('cancelInvite', { name: initiator.name }));
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('acceptInvite')
	async acceptInvite(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			if (!body || !body.name)
				throw new BadRequestException('have no body or player name');
			const initiator = await this.findByName(body.name);
			const who = await this.allConnected.get(client.id);
			if (!initiator)
				throw new NotFoundException(body.name + ' not avaible rigth now');
			console.log('res acceptInvite initiator emit =', initiator.emit('startGame', { name: who.name }));
			console.log('res acceptInvite who emit =', who.emit('startGame', { name: initiator.name }));
			for (let i = 0; i < this.invites.length; i++)
				if (this.invites[i].initiator.id == initiator.id)
					this.invites.slice(i);
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('declinceInvite')
	async declinesInvite(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			if (!body || !body.name)
				throw new BadRequestException('have no body or player name');
			const initiator = await this.findByName(body.name);
			const who = await this.allConnected.get(client.id);
			if (!initiator)
				throw new NotFoundException(body.name + ' not avaible rigth now');
			console.log('res declince initiator emit =', initiator.emit('declince', { name: who.name }));
			for (let i = 0; i < this.invites.length; i++)
				if (this.invites[i].initiator.id == initiator.id)
					this.invites.slice(i);
		}
		catch (e) { this.errorMessage(e, client); }
	}

	async handleConnection(@ConnectedSocket() client: any) {
		try {
			await this.initSrv();
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
			console.log('\n' + 'handle connection in INVITE ' + name42 + ' connected\n');
			client.user_id_in_db = user.id;
			client.user_name_in_db = user.name;
			this.allConnected.set(client.id, client);
		}
		catch (e) { console.log('\nexception in INVITE:\n', e); this.errorMessage(e, client); }
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		try {
			const userInConnected: any = await this.allConnected.get(client.id);
			this.allConnected.delete(client.id);
			console.log('\nclient ' + (userInConnected ? userInConnected.name : 'unknown') + ' disconnected\n');
		}
		catch (e) { this.errorMessage(e, client); }
	}
}
