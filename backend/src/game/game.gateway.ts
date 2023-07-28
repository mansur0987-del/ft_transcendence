import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import {
	BadRequestException,
	ForbiddenException,
	NotFoundException
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/service/auth.service';
import { Mode } from './interfaces/mode.interface';
import { RoomService } from './services/room.service';
import { Player } from './interfaces/player.interface';
import { Room } from './interfaces/room.interface';
import { PlayerService } from 'src/player/service/player.service';
import { PlayerStatus } from 'src/player/enums/playerStatus.enum';

@WebSocketGateway({
  cors: {
		origin: process.env.FRONT_URL,
	},
  namespace: 'pong',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: PlayerService,
    private readonly roomService: RoomService,
    private readonly MatchService: PlayerService,
  ) {}
  @WebSocketServer()
  server: any;

  errorMessage(response: any, client: Socket) {
		console.log('exception:\n' + response);
		client.emit('msgFromServer', {
			error: (response?.reason)
		})
	}

  // THIS ONE IS HANDLING CONNECTION BASED ON THE TOKEN THAT GIVEN
  async handleConnection(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      // THIS IS A RISK ZONE
      const token = client.request.headers.authorization && client.request.headers.authorization.split(' ')[1];
      if (!token) {
        return client.disconnect();
      } else {
        console.log('Token found!', token);
      }
      let user: any;
      // THIS IS A RISK ZONE
      const user42 = await this.jwtService.verify(token, { publicKey: process.env.JWT_ACCESS_KEY }); // MAYBE CALLBACK INSTEAD OF RETRIEVEUSER (authService.retrieveUser(client);)
      if (!user42.name42) {
        return client.disconnect();
      } else {
        user = await this.MatchService.GetPlayerByName42(user42.name42);
      }
      if (!user) {
        return client.disconnect();
      }
      client.data.player = user;
      client.emit('info', { user });
    } catch (ex) {
      console.log(ex);
    }
  }

  async handleDisconnect(client: Socket): Promise<any> {
    try {
      if (!client.data.player) return;

      await this.roomService.deleteSock(client);
    } catch {}
  }

  @SubscribeMessage('add')
  joinQueue(@ConnectedSocket() client: Socket): void {
    try {
      console.log('client.data.player');
      console.log(client.data.player);
      if (!client.data.player) {
        console.log("CHECK_IF_DADA_USER")
        return;

      }
      // if (this.roomService.findPlayer(Socket.data.player.id) == ) return;
      this.roomService.addSock(client);
      console.log('add_back');
      console.log(client.data);
      console.log('client.data.PLAYER');
      console.log(client.data.player);
      console.log('client.data.player.ID');
      console.log(client.data.player.id);

    } catch (e){console.log("EXEPTION_88:\n", e)}
  }

  @SubscribeMessage('roomInfo')
  roomInfo(@ConnectedSocket()client: Socket, @MessageBody() code?: string)
  {
    try {
      if (!client)
      {
        console.log('NoSocket')
        return ;
      }
      if (!code)
      {
        console.log('NoCode')
        return ;
      }
      const roomInfo = this.roomService.getRoomInfo(code);
      if (!roomInfo)
        throw new NotFoundException('no room or wrong number of players')
      const toSend = {
        id: roomInfo.id,
        firstPlayerId: roomInfo.firstPlayerId,
        firstPlayerName: roomInfo.firstPlayerName,
        secondPlayerId: roomInfo.secondPlayerId,
        secondPlayerName: roomInfo.secondPlayerName,
        mode: roomInfo.mode
      }
      roomInfo.firstPlSock.emit('roomInfoServer', toSend);
      roomInfo.secondPlSock.emit('roomInfoServer', toSend);
    } catch (e){console.log("EXCEPTION:\n", e)}
  }

  @SubscribeMessage('changeMode')
  changeMode(@ConnectedSocket()client: Socket, @MessageBody() body: any) {
    try {
      if (body.newMode < 0 || body.newMode > 2)
        throw new BadRequestException('BAD newMode');
      let newRoom = this.roomService.changeRoomMode(client, body.code, body.newMode);
      const toSend = {
        id: newRoom.code,
        firstPlayerId: newRoom.players[0].player.id,
        firstPlayerName: newRoom.players[0].player.name,
        secondPlayerId: newRoom.players[1].player.id,
        secondPlayerName: newRoom.players[1].player.name,
        mode: newRoom.options.mode
      }
      newRoom.players[0].socket.emit('roomInfoServer', toSend);
      newRoom.players[1].socket.emit('roomInfoServer', toSend);
    }
    catch (e) { this.errorMessage(e.response, client); }
  }

  @SubscribeMessage('join-room')
  joinRoom(client: Socket, code?: string): void {
    try {
      if (!client.data.player) 
        throw new ForbiddenException('Bad client: Socket')

      let room: Room = this.roomService.findRoom(code);
      console.log('findRoom');
      console.log(room);
      
      if (!room)
        throw new NotFoundException('room ' + code + 'not found');

      this.roomService.joinRoom(client, room);

    } catch (e) { this.errorMessage(e.response, client); }
  }

  @SubscribeMessage('ready')
  onReady(client: Socket, input: Mode): void {
    try {
      if (!client.data.player) return;

      const player: Player = this.roomService.findPlayer(client.data.player.id);
      if (!player) return;

      this.roomService.ready(player, input);
    } catch {}
  }



  @SubscribeMessage('start')
  onStart(client: Socket): void {
    try {
      if (!client.data.player) return;

      const player: Player = this.roomService.findPlayer(client.data.player.id);
      if (!player || !player.room) return;

      this.roomService.startCalc(player.room);
    } catch {}
  }

  @SubscribeMessage('update-paddle')
  updatePaddle(client: Socket, paddle: number): void {
    try {
      if (!client.data.player) return;

      const player: Player = this.roomService.findPlayer(client.data.player.id);
      if (!player) return;

      player.paddle = paddle * player.room.options.playground.height;
      const playerIndex = player.room.players.indexOf(player);
      RoomService.emit(player.room, 'paddle', playerIndex, paddle);
    } catch {}
  }
}
