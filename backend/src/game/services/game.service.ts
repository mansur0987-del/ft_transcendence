import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Position, Room } from '../interfaces';
import { RoomService } from './room.service';

@Injectable()
export class GameService {
  constructor(
    // FORWARD REF RESOLVES CIRCULAR DEPENDENCY
    @Inject(forwardRef(() => RoomService)) private roomService: RoomService,
  ) {
    console.log('GAME SERVICE STARTED');
  }

  static velocity = (speed: number, radian: number): Position => {
    // CONVERT CARTESIAN TO POLAR
    return { x: Math.cos(radian) * speed, y: Math.sin(radian) * speed };
  };

  updateBall(x: number, y: number, radian: number, room: Room): void {
    room.ball.position.x = x;
    room.ball.position.y = y;
    room.ball.velocity = GameService.velocity((room.speed *= 1.01), radian);
    RoomService.emit(room, 'ball', room.ball.position);
  }

  resetBall(room: Room, left?: boolean): void {
    // RANDOMLY GENERATES THE DIRECTION OF THE BALL
    let radian = (Math.random() * Math.PI) / 2 - Math.PI / 4;
    // THE BALL ALWAYS GENERATES ON THE LOSER'S SIDE
    if (left) radian += Math.PI;

    // SETTING ROOM SPEED TO THE VALUE OF BALL SPEED
    room.speed = room.options.ball.speed;
    
    // PUTS THE BALL IN THE MIDDLE OF THE PLAYGROUND
    this.updateBall(
      room.options.playground.width / 2,
      room.options.playground.height / 2,
      radian,
      room,
    );
  }

  updateGame(room: Room): any {
    // console.log('updateGame !!!!!!!');
    const next = {
      x: room.ball.position.x + room.ball.velocity.x,
      y: room.ball.position.y + room.ball.velocity.y,
    };

    // sides + score
    // CHECK IF THE BALL COLLIDES
    if (
      next.x - room.options.ball.radius < 0 ||
      next.x + room.options.ball.radius > room.options.playground.width
    ) {
      // IF THE BALL IS COLLIDED WITH THE SIDE OF THE PLAYGROUND THAT IS WINNING
      if (next.x > room.options.ball.radius) room.players[0].score++;
      else room.players[1].score++;

      // THE ROOM SERVICE TELLS THE PLAYERS SOCKETS THAT THE PLAYER HAD SCORED A GOAL
      RoomService.emit(
        room,
        'score',
        room.players.map((player) => player.score),
      );

      // CHECK IF THE GAME IS OVER
      for (const player of room.players)
        if (player.score == room.options.score.max)
          return this.roomService.stopGame(room, player);

      this.resetBall(
        room,
        next.x + room.options.ball.radius > room.options.playground.width,
      );
    }

    // player 1
    if (
      next.y >= room.players[0].paddle - room.options.paddle.height / 2 &&
      next.y <= room.players[0].paddle + room.options.paddle.height / 2
    )
      if (next.x - room.options.ball.radius < room.options.paddle.x)
        return this.updateBall(
          room.ball.position.x,
          room.ball.position.y,
          (Math.random() * Math.PI) / 2 - Math.PI / 4,
          room,
        );

    //player 2
    if (
      next.y >= room.players[1].paddle - room.options.paddle.height / 2 &&
      next.y <= room.players[1].paddle + room.options.paddle.height / 2
    )
      if (
        next.x + room.options.ball.radius >
        room.options.playground.width - room.options.paddle.x
      )
        return this.updateBall(
          room.ball.position.x,
          room.ball.position.y,
          (Math.random() * Math.PI) / 2 - Math.PI / 4 + Math.PI,
          room,
        );

    //floor n top
    if (
      //CHECKS COLLISION WITH THE FLOOR OR THE TOP OF THE PLAYGROUND
      next.y - room.options.ball.radius < 0 ||
      next.y + room.options.ball.radius > room.options.playground.height
    )
    // CHANGES THE TRAGECTORY OF THE BALL
      room.ball.velocity.y *= -1;

    //normal behavior
    room.ball.position.x += room.ball.velocity.x;
    room.ball.position.y += room.ball.velocity.y;
    RoomService.emit(room, 'ball', room.ball.position);
  }
}
