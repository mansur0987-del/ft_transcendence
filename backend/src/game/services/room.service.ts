import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Socket } from 'socket.io';
import { MatchEntity } from 'src/player/entities/match.entity';
import { MatchService } from 'src/player/service/match.service';
import { GameOptions, Mode, Room, State, Player } from '../interfaces';
import { GameService } from './game.service';
import { PlayerEntity } from "src/player/entities/player.entity";

@Injectable()
export class RoomService {
  constructor(
    private readonly game: GameService,
    private readonly matchService: MatchService,
  ) {
    console.log('ROOM SERVICE STARTED');
  }

  /**
   * game settings
   */
  static settings: GameOptions = Object.freeze({
    playground: { width: 1920, height: 1080 },
    ball: { speed: 20, radius: 20 },
    paddle: { width: 20, height: 200, x: 50 },
    score: { y: 15, max: 10 },
    mode: 0,
  });

  /**
   * matchmaking queue
   */
  queue: Array<Socket> = [];
  rooms: Map<string, Room> = new Map();

  /**
   * emit updates to room participants
   */
  static emit(room: Room, event: string, ...args: any): void {
    for (const player of room.players) player.socket.emit(event, ...args);
  }

  changeRoomMode(client: Socket, code: string, newMode: number): Room {
    console.log('changeRoomMode UPPPPPPPPPPPPPPPP');
    const thisRoom = this.findRoom(code);
    if (!thisRoom) throw new NotFoundException('room not found');
    let accessFlg = false;
    for (let i = 0; i < thisRoom.players.length; i++) {
      if (client.data.player.id == thisRoom.players[i].socket.data.player.id)
        accessFlg = true;
    }
    if (!accessFlg) throw new ForbiddenException('player not in this room');
    thisRoom.options.mode = newMode;
    for (let i = 0; i < thisRoom.players.length; i++) {
      thisRoom.players[i].mode = newMode;
    }
    this.rooms.set(code, thisRoom);
    return thisRoom;
  }

  createRoom(code: string = null): Room {
    // generate unique hex
    while (!code) {
      const length = 10;
      const id = Math.random() * Math.pow(16, length);
      const generated = Math.floor(id).toString(16);

      if (!this.rooms.has(generated)) code = generated;
    }

    // create room
    const room: Room = {
      code,
      state: State.WAITING,
      players: [],
      options: JSON.parse(JSON.stringify(RoomService.settings)),
      ball: { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
      speed: 0,
      exitPushed: null
    };
    // associate hex code with new room
    this.rooms.set(code, room);

    return room;
  }

  joinRoom(socket: Socket, room: Room): void {
    // console.log("-------joinRoom started!--------")
    // console.log(socket.data.player.id)
    if (room.state == State.WAITING) {
      // create player instance
      const player: Player = {
        socket,
        player: socket.data.player, // gameSocket.on('name', ... + emit());
        room,
        mode: null,
        paddle: RoomService.settings.playground.height / 2,
        score: 0,
      };
      room.players.push(player);

      if (room.players.length == 2) room.state = State.STARTING;
    } else {
      socket.emit(
        'ready',
        room.options,
        room.players.map((player) => player.player) /* player entity array */,
      );
    }

    socket.emit('room', room.code);
  }

  addSock(socket: Socket): void {
    // console.log('STARTED_SOCK')
    // console.log(socket)
    // console.log(socket.data)
    // ensure the player isn't already in the queue
    for (const sock of this.queue) {
      // console.log('FOR_')
      // console.log(sock.data.player)

      if (sock.data.player.id == socket.data.player.id) return;
    }

    if (this.findPlayer(socket.data.player.id)) return;

    // add to the queue
    console.log('QUEUE:');
    console.log(this.queue);
    this.queue.push(socket);

    // emit queue length
    console.log('QUEUE_LENGTH:');
    console.log(this.queue.length);
    socket.emit('add', this.queue.length);
    // if not enough players, leave
    if (this.queue.length < 2) return;

    // create a room
    const room: Room = this.createRoom();
    // iterate over queue and join players
    while (this.queue.length && room.players.length < 2) {
      console.log('ROOMSERVICE: JoinRoom');
      this.joinRoom(this.queue.shift(), room);
      console.log('ROOMSERVICE: JoinRoom DONE!!');
    }
  }

  /**
   * find room object by hex code
   */
  findRoom(code: string): Room {
    return this.rooms.get(code);
  }

  findPlayer(uid: number): Player {
    for (const room of this.rooms.values())
      for (const player of room.players)
        if (player.player.id == uid) return player;
    return null;
  }

  findRoomForUser(uid: number): Room {
    const rooms = Array.from(this.rooms.values());
    const room = rooms.find(
      (room) => !!room.players.find((player) => player.player.id == uid),
    );

    if (!room) throw new HttpException('Room not found', HttpStatus.NOT_FOUND);

    return room;
  }
  //..

  startGame(room: Room): void {
    console.log('startGame');
    if (room.state != State.STARTING) return;
    room.state = State.WAITING;


    if (room.options.mode == Mode.FAST_BALL) {
      console.log('FAST_BALL');
      room.options.ball.radius = 25;
      room.options.ball.speed = 30;
    } else if (room.options.mode == Mode.SMALL_PADDLE) {
      console.log('SMALL_PADDLE');
      room.options.paddle.height = 50;
      RoomService.emit(room, 'paddleHeight', room.options.paddle.height);
    }

  }

  async stopGame(room: Room, player: Player): Promise<void> {
    console.log('stopGame');
    if (!player) return;
    if (room.state == State.END) return;
    room.state = State.END;

    if (room.players.length == 2) {
      //if game is not complete(no score with value 3)
      let loser: PlayerEntity;
      let winner: PlayerEntity;
      console.log('stopGame exit pushed=', room.exitPushed)
      if (room.exitPushed != null) {
        loser = room.players[0].player.id == room.exitPushed ? room.players[0].player : room.players[1].player;
        winner = room.players[0].player.id != room.exitPushed ? room.players[0].player : room.players[1].player;
      }
      else {
        loser = room.players.find(
          (player1) => player1.player.id != player.player.id,
        ).player;
        // THE ARG PASSED IS ALWAYS THE WINNER
        winner = player.player;
      }

      // SCORE IS AN ARRAY OF BOTH PLAYERS SCORES
      const score = room.players.map((player) => player.score);

      room.players.forEach((player) => this.deleteSock(player.socket));
      const mode = room.options.mode;
      // SAVE THE DATA IN MATCH ENTITY
      await this.matchService.create({
        score,
        winner,
        loser,
        mode
      } as MatchEntity);
    }
  }
  // DOES IT WORK FOR BOTH CLIENTS?
  ready(player: Player, mode: Mode): void {
    console.log('ready');
    player.mode = mode;
    this.startGame(player.room);
  }

  /*
   * STARTS THE GAME
   */
  startCalc(room: Room): void {
    console.log('startCalc');
    // if (room.state != State.COUNTDOWN) return;
    this.game.resetBall(room);
    room.state = State.INGAME;
  }

  @Interval(1000 / 30)
  loop(): void {
    for (const room of this.rooms.values()) {
      // console.log('room state: ' + room.state);
      if (room.state == State.INGAME) this.game.updateGame(room);
    }
  }

  async deleteSock(socket: Socket): Promise<any> {
    if (this.queue.indexOf(socket) != -1)
      return this.queue.splice(this.queue.indexOf(socket), 1);

    // AS LONG AS WE DO NOT HAVE SPECTATORS, WE REMOVE THEESE 3 LINES
    for (const room of this.rooms.values()) {
      //   if (room.spectators && room.spectators.indexOf(socket) != -1)
      //     return room.spectators.splice(room.spectators.indexOf(socket), 1);

      // TRAVERSE ALL THE PLAYERS IN THE ROOM AND REMOVE THE PLAYER THAT IS CONNECTED TO THE SOCKET (ARGUMENT)
      for (const player of room.players)
        if (player.socket.id == socket.id) {
          // WHY DOES STOP THE GAME FOR THE OPPONENT?
          await this.stopGame(
            room,
            room.players.find(
              (player1) => player1.player.id != player.player.id,
            ),
          );
          room.players.splice(room.players.indexOf(player), 1);
          break;
        }
      // IF THE ROOM IS EMPTY, DELETE IT
      if (!room.players.length) return this.rooms.delete(room.code);
    }
  }

  getRoomInfo(code?: string): any {
    const thisRoom = this.findRoom(code);
    if (!thisRoom || thisRoom.players.length != 2) return null;
    return {
      id: code,
      firstPlayerId: thisRoom.players[0].player.id,
      firstPlayerName: thisRoom.players[0].player.name,
      firstPlSock: thisRoom.players[0].socket,
      secondPlayerId: thisRoom.players[1].player.id,
      secondPlayerName: thisRoom.players[1].player.name,
      secondPlSock: thisRoom.players[1].socket,
      mode: thisRoom.options.mode,
    };
  }

  saveExitPushed(client: Socket, code: string) {
    console.log('saveExitPushed =', client.data.player.id);
    this.rooms.get(code).exitPushed = client.data.player.id;
  }
}
