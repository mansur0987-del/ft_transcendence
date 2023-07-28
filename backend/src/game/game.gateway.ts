import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets';
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
  async handleConnection(client: Socket): Promise<any> {
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

      client.data.user = user;
      client.emit('info', { user });
    } catch (ex) {
      console.log(ex);
    }
  }

  async handleDisconnect(client: Socket): Promise<any> {
    try {
      if (!client.data.user) return;

      await this.roomService.deleteSock(client);
    } catch {}
  }

  @SubscribeMessage('add')
  joinQueue(@ConnectedSocket() client: Socket): void {
    try {
      console.log('client.data.user');
      console.log(client.data.user);
      if (!client.data.user) {
        return;
      }
      this.roomService.addSock(client);
      console.log('add_back');
    } catch {}
  }

  @SubscribeMessage('join-room')
  joinRoom(client: Socket, code?: string): void {
    try {
      if (!client.data.user) return;

      let room: Room = this.roomService.findRoom(code);
      if (!room) room = this.roomService.createRoom(code);

      this.roomService.joinRoom(client, room);
    } catch {}
  }

  @SubscribeMessage('ready')
  onReady(client: Socket, input: Mode): void {
    try {
      if (!client.data.user) return;

      const player: Player = this.roomService.findPlayer(client.data.user.id);
      if (!player) return;

      this.roomService.ready(player, input);
    } catch {}
  }

  @SubscribeMessage('start')
  onStart(client: Socket): void {
    try {
      if (!client.data.user) return;

      const player: Player = this.roomService.findPlayer(client.data.user.id);
      if (!player || !player.room) return;

      this.roomService.startCalc(player.room);
    } catch {}
  }

  @SubscribeMessage('update-paddle')
  updatePaddle(client: Socket, paddle: number): void {
    try {
      if (!client.data.user) return;

      const player: Player = this.roomService.findPlayer(client.data.user.id);
      if (!player) return;

      player.paddle = paddle * player.room.options.playground.height;
      const playerIndex = player.room.players.indexOf(player);
      RoomService.emit(player.room, 'paddle', playerIndex, paddle);
    } catch {}
  }
}
