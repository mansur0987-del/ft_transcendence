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
	async cancelOtherInvitesInitiator(all: Notify[], initiator_id: number) {
		for (let i = 0; i < all.length; i++) {
			//send cancel
			await this.allConnected.forEach(element => {
				if (element.user_id_in_db == all[i].who_id) {
					element.emit('cancelInvite', { id: initiator_id });
				}
			});
			//deletefrom BD
			await this.notifyService.removeAllNotify(all);
		}
	}

	async cancelOtherInvitesWho(all: Notify[], who_id: number) {
		for (let i = 0; i < all.length; i++) {
			//send cancel
			await this.allConnected.forEach(element => {
				if (element.user_id_in_db == all[i].initiator_id) {
					element.emit('declince', { id: who_id });
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

	async findById(id: number): Promise<any> {
		let who: any = null;
		this.allConnected.forEach((element) => {
			if (element.user_id_in_db == id) {
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
			if (!body || !body.id)
				throw new BadRequestException('have no body or player id');
			const initiator = await this.allConnected.get(client.id);
			const who = await this.findById(body.id);
			if (!who)
				throw new NotFoundException(body.id + ' not avaible rigth now');
			const invites = await this.notifyService.findAllByInitiatorId(initiator.user_id_in_db);
			await this.cancelOtherInvitesInitiator(invites, initiator.user_id_in_db);
			const toFaceInvite = await this.notifyService.findOneByIds(who.user_id_in_db, initiator.user_id_in_db);
			if (!toFaceInvite) {
					const newRawInvite = await this.notifyService.addRawToNotify({
					initiator_id: initiator.user_id_in_db,
					initiator_name: initiator.user_name_in_db,
					who_id: who.user_id_in_db,
					who_name: who.user_name_in_db
				})
				console.log('res invitePlayerInitiator emit =', who.emit('GetInvite', { newRawInvite }));
				return;
			}
			this.notifyService.deleteRawNotifyByIdRaw(toFaceInvite.id);

			let invitesToFace = await this.notifyService.findAllByWhoId(who.user_id_in_db);
			await this.cancelOtherInvitesWho(invitesToFace, who.user_id_in_db);

			invitesToFace = await this.notifyService.findAllByInitiatorId(who.user_id_in_db);
			await this.cancelOtherInvitesInitiator(invitesToFace, who.user_id_in_db);

			invitesToFace = await this.notifyService.findAllByWhoId(initiator.user_id_in_db);
			await this.cancelOtherInvitesWho(invitesToFace, initiator.user_id_in_db);

			console.log('res acceptInvite initiator emit =', initiator.emit('startGame', { id: who.user_id_in_db }));
			console.log('res acceptInvite who emit =', who.emit('startGame', { id: initiator.user_id_in_db }));
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('cancelInviteInitiator')
	async cancelInviteInitiator(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			if (!body || !body.id)
				throw new BadRequestException('have no body or player id');
			const initiator = await this.allConnected.get(client.id);
			const who = await this.findById(body.id);

			const inviteObj = await this.notifyService.findOneByIds(initiator.user_id_in_db, body.id);
			this.notifyService.deleteRawNotifyByIdRaw(inviteObj.id);

			console.log('res cancelInviteInitiator emit =', who.emit('cancelInvite', { id: initiator.user_id_in_db }));
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('acceptInvite')
	async acceptInvite(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			if (!body || !body.id)
				throw new BadRequestException('have no body or player id');
			const initiator = await this.findById(body.id);
			const who = await this.allConnected.get(client.id);
			if (!initiator)
				throw new NotFoundException(body.id + ' not avaible rigth now');

			const inviteObj = await this.notifyService.findOneByIds(initiator.user_id_in_db, who.user_id_in_db);
			this.notifyService.deleteRawNotifyByIdRaw(inviteObj.id);

			let invites = await this.notifyService.findAllByWhoId(who.user_id_in_db);
			await this.cancelOtherInvitesWho(invites, who.user_id_in_db);

			invites = await this.notifyService.findAllByInitiatorId(who.user_id_in_db);
			await this.cancelOtherInvitesInitiator(invites, who.user_id_in_db);

			invites = await this.notifyService.findAllByWhoId(initiator.user_id_in_db);
			await this.cancelOtherInvitesWho(invites, initiator.user_id_in_db);

			console.log('res acceptInvite initiator emit =', initiator.emit('startGame', { id: who.user_id_in_db }));
			console.log('res acceptInvite who emit =', who.emit('startGame', { id: initiator.user_id_in_db }));
		}
		catch (e) { this.errorMessage(e, client); }
	}

	@SubscribeMessage('declinceInvite')
	async declinesInvite(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		try {
			console.log('body in declince: ', body);
			if (!body || !body.id)
				throw new BadRequestException('have no body or player id');
			const initiator = await this.findById(body.id);
			const who = await this.allConnected.get(client.id);
			if (!initiator)
				throw new NotFoundException(body.id + ' not avaible rigth now');
			console.log('res declince initiator emit =', initiator.emit('declince', { id: who.user_id_in_db }));

			const inviteObj = await this.notifyService.findOneByIds(initiator.user_id_in_db, who.user_id_in_db);
			this.notifyService.deleteRawNotifyByIdRaw(inviteObj.id);
		}
		catch (e) { this.errorMessage(e, client); }
	}

	// @SubscribeMessage('changeName')
	// async changeUserName(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
	// 	try {
	// 		if (!body || !body.name)
	// 			throw new BadRequestException('have no body or player name');
	// 		const user = await this.allConnected.get(client.id);
	// 		if (user)
	// 			this.allConnected.get(client.id).user_name_in_db = body.name;
	// 		await this.notifyService.changeUserName(user.user_id_in_db, body.name);
	// 	}
	// 	catch (e) {
	// 		await this.errorMessage(e, client);
	// 		let nots: Notify[] = await this.notifyService.findAllByInitiatorId((await this.allConnected.get(client.id).user_id_in_db));
	// 		await this.cancelOtherInvitesInitiator(nots, (await this.allConnected.get(client.id).user_id_in_db).user_name_in_db);
	// 		nots = await this.notifyService.findAllByWhoId((await this.allConnected.get(client.id).user_id_in_db));
	// 		await this.cancelOtherInvitesInitiator(nots, (await this.allConnected.get(client.id).user_id_in_db).user_name_in_db);
	// 		client.disconnect();
	// 	}
	// }

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
			await console.log('\nclient in INVITE disconnected\n');
			this.allConnected.delete(client.id);
		}
		catch (e) { this.errorMessage(e, client); }
	}
}
