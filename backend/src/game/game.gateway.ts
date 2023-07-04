import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private connectedClients: Socket[] = [];
  gameService: any;
  server: any;

  handleConnection(client: Socket) {
    // 
    this.connectedClients.push(client);
  }

  handleDisconnect(client: Socket) {
    const index = this.connectedClients.indexOf(client);
    if (index !== -1) {
      this.connectedClients.splice(index, 1);
    }
  }

  @SubscribeMessage('play')
  async handlePlay(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    const { gameId, move } = payload;
    try {
      const game = await this.gameService.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      // keeping the coords of the game objects - paddle1, paddle2, middle line of the board, vector of the ball

      const p1 = GameService.getPlayer(game, 1);
      const p2 = GameService.getPlayer(game, 2);

      // Perform game logic based on the received move
      const updatedGame = this.gameService.performGameLogic(game, move);

      // Update the game state
      await this.gameService.updateGame(gameId, updatedGame);

      // Emit the updated game state to all players in the game room
      this.server.to(gameId).emit('gameState', updatedGame);
    } catch (error) {
      // Handle errors and emit an error message to the player
      this.emitErrorMessage(client, error.message);
    }
  }

  private emitGameState(gameId: string, game: any) {
    // Emit the game state to all players in the game room
    this.server.to(gameId).emit('gameState', game);
  }

  private emitErrorMessage(client: Socket, errorMessage: string) {
    // Emit an error message to the specific player
    client.emit('error', errorMessage);
  }
}



// import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway()
// export class GameGateway {
//   @WebSocketServer()
//   server: Server;

//     // Handler for the 'connection' event
//   handleConnection(client: Socket) {
//     // Logic to handle a new WebSocket connection
//   }

//   @SubscribeMessage('play')
//   handlePlay(client: Socket, payload: any) {
//     // Perform game logic based on the received move
//     // You can access the payload data sent by the client
//     // and use it to update the game state or perform any other necessary actions
//   }

//   // Handler for the 'disconnect' event
//   handleDisconnect(client: Socket) {
//     // Logic to handle a WebSocket disconnection
//   }

//   // Handler for other events and messages
//   @SubscribeMessage('event')
//   handleEvent(client: Socket, payload: any) {
//     // Handle other WebSocket events and messages
//   }
// }
