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
import { NotifyService } from "./notify.services";
import { Notify } from "./notify.entity"
import { awaitExpression } from "@babel/types";

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
		private readonly notifyService: NotifyService
	) { }
	@WebSocketServer()
	server: Server;
	allConnected: Map<string, any>;
	//utils
	async cancelOtherInvitesInitiator(all: Notify[], initiator_name: string) {
		for (let i = 0; i < all.length; i++) {
			//send cancel
			await this.allConnected.forEach(element => {
				if (element.user_name_in_db == all[i].who_name) {
					element.emit('cancelInvite', { name: initiator_name });
				}
			});
			//deletefrom BD
			await this.notifyService.removeAllNotify(all);
		}
	}

	async cancelOtherInvitesWho(all: Notify[], who_name: string) {
		for (let i = 0; i < all.length; i++) {
			//send cancel
			await this.allConnected.forEach(element => {
				if (element.user_name_in_db == all[i].initiator_name) {
					element.emit('declinceInvite', { name: who_name });
				}
			});
			//deletefrom BD
			await this.notifyService.removeAllNotify(all);
		}
	}

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
			const invites = await this.notifyService.findAllByInitiatorId(initiator.user_id_in_db);
			await this.cancelOtherInvitesInitiator(invites, initiator.user_name_in_db);
			this.notifyService.addRawToNotify({
				initiator_id: initiator.user_id_in_db,
				initiator_name: initiator.user_name_in_db,
				who_id: who.user_id_in_db,
				who_name: who.user_name_in_db
			})
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

			const inviteObj = await this.notifyService.findOneByNames(initiator.user_name_in_db, body.name);
			this.notifyService.deleteRawNotifyByIdRaw(inviteObj.id);

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

			const inviteObj = await this.notifyService.findOneByNames(initiator.user_name_in_db, who.name);
			this.notifyService.deleteRawNotifyByIdRaw(inviteObj.id);

			let invites = await this.notifyService.findAllByWhoId(who.user_id_in_db);
			await this.cancelOtherInvitesWho(invites, who.user_name_in_db);

			invites = await this.notifyService.findAllByInitiatorId(who.user_id_in_db);
			await this.cancelOtherInvitesInitiator(invites, who.user_name_in_db);
			
			invites = await this.notifyService.findAllByWhoId(initiator.user_id_in_db);
			await this.cancelOtherInvitesWho(invites, initiator.user_id_in_db);

			console.log('res acceptInvite initiator emit =', initiator.emit('startGame', { name: who.name }));
			console.log('res acceptInvite who emit =', who.emit('startGame', { name: initiator.name }));
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

			const inviteObj = await this.notifyService.findOneByNames(initiator.user_name_in_db, who.name);
			this.notifyService.deleteRawNotifyByIdRaw(inviteObj.id);
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('changeName')
	async changeUserName(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			if (!body || !body.name)
				throw new BadRequestException('have no body or player name');
			const user = await this.allConnected.get(client.id);
			if (user)
				this.allConnected.get(client.id).user_name_in_db = body.name;
			await this.notifyService.changeUserName(user.user_id_in_db, body.name);
		}
		catch (e) {
			await this.errorMessage(e, client);
			let nots: Notify[] = await this.notifyService.findAllByInitiatorId((await this.allConnected.get(client.id).user_id_in_db));
			await this.cancelOtherInvitesInitiator(nots, (await this.allConnected.get(client.id).user_id_in_db).user_name_in_db);
			nots = await this.notifyService.findAllByWhoId((await this.allConnected.get(client.id).user_id_in_db));
			await this.cancelOtherInvitesInitiator(nots, (await this.allConnected.get(client.id).user_id_in_db).user_name_in_db);
			client.disconnect();
		}
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
