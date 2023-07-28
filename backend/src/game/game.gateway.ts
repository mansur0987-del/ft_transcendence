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
    } catch (e) { console.log(e); }
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
    } catch (e){console.log("EXEPTION:\n", e)}
  }

  @SubscribeMessage('roomInfo')
  roomInfo(@ConnectedSocket() client: Socket, @MessageBody() code?: string)
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
      if (!roomInfo) {
          client.emit('roomInfoServer', {error: 'no room or wrong number of players'});
          return;
      }
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
    } catch (e) {console.log("EXEPTION:\n", e)}
  }

  @SubscribeMessage('changeMode')
  changeMode(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    try {
      if (body.newMode < 0 || body.newMode > 2) {
        client.emit('roomInfoServer', {error: 'BAD newMode'});
        return;
      }
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
    catch (e) {console.log("EXEPTION:\n", e)}
  }

  @SubscribeMessage('join-room')
  joinRoom(@ConnectedSocket() client: Socket, @MessageBody() code?: string): void {
    try {
      if (!client.data.player) {
        client.emit('roomInfoServer', {error: 'BAD client: Socket'});
        return;
      }

      let room: Room = this.roomService.findRoom(code);
      console.log('findRoom');
      console.log(room);
      
      if (!room) {
        client.emit('roomInfoServer', {error: 'room not found'});
        return;
      }

      this.roomService.joinRoom(client, room);

    } catch (e) {console.log("EXEPTION:\n", e)}
  }

  @SubscribeMessage('ready')
  onReady(@ConnectedSocket() client: Socket, input: Mode): void {
    try {
      if (!client.data.player) return;

      const player: Player = this.roomService.findPlayer(client.data.player.id);
      if (!player) return;

      this.roomService.ready(player, input);
    } catch (e) {console.log("EXEPTION:\n", e)}
  }



  @SubscribeMessage('start')
  onStart(@ConnectedSocket() client: Socket): void {
    try {
      if (!client.data.player) return;

      const player: Player = this.roomService.findPlayer(client.data.player.id);
      if (!player || !player.room) return;

      this.roomService.startCalc(player.room);
    } catch (e) {console.log("EXEPTION:\n", e)}
  }

  @SubscribeMessage('update-paddle')
  updatePaddle(@ConnectedSocket() client: Socket, paddle: number): void {
    try {
      if (!client.data.player) return;

      const player: Player = this.roomService.findPlayer(client.data.player.id);
      if (!player) return;

      player.paddle = paddle * player.room.options.playground.height;
      const playerIndex = player.room.players.indexOf(player);
      RoomService.emit(player.room, 'paddle', playerIndex, paddle);
    } catch (e) {console.log("EXEPTION:\n", e)}
  }

   @SubscribeMessage('exitGame')
   exitGame(@ConnectedSocket() client: Socket, @MessageBody() code: string) {
    if (!client.data.player) {
      console.log('no such client');
      return;
    }
    if (!code) {
      console.log('NULL code');
      return;
    }
    const thisRoom = this.roomService.findRoom(code);
    if (!thisRoom) {
      console.log('no such room');
      return;
    }
    
    for (let i = 0; i < thisRoom.players.length; i++) {
      thisRoom.players[i].socket.emit('exit');
    }
  }
}
