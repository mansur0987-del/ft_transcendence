import { Injectable } from '@nestjs/common';
import { Game } from './entities/game.entity';
import { PlayerEntity } from '../player/entities/player.entity';

@Injectable()
export class GameService {
  private games: Game[] = [];

  initializeGame(player1: PlayerEntity, player2: PlayerEntity): Game {
    // Create a new game instance
    const game: Game = {
      id: this.generateGameId(),
      player1,
      player2,
      player1Score: 0,
      player2Score: 0,
      gameState: 'active',
      createdAt: new Date(),
      result: ''
    };

    // Store the game in the games array
    this.games.push(game);

    return game;
  }

  getPlayerGames(playerId: number): Game[] {
    // Retrieve all games in which the player is participating
    const playerGames = this.games.filter(
      (game) => game.player1.id === playerId || game.player2.id === playerId,
    );

    return playerGames;
  }

  movePlayer(gameId: number, playerId: number, newPosition: number): void {
    // Find the game by ID
    const game = this.findGameById(gameId);

    // Update the player position based on the new position
    if (game.player1.id === playerId) {
      game.player1.position = newPosition;
    } else if (game.player2.id === playerId) {
      game.player2.position = newPosition;
    }

    // Update the game state if needed

    // Emit the updated game state to the players
    this.emitGameState(gameId, game);
  }

  moveBall(gameId: number): void {
    // Find the game by ID
    const game = this.findGameById(gameId);

    // Perform the ball movement logic
    // Update the ball position and direction

    // Check for collisions with walls, paddles, or other game elements

    // Update the game state if needed

    // Emit the updated game state to the players
    this.emitGameState(gameId, game);
  }

  updateScore(gameId: number, playerId: number): void {
    // Find the game by ID
    const game = this.findGameById(gameId);

    // Update the score based on the player who scored
    if (game.player1.id === playerId) {
      game.player1Score++;
    } else if (game.player2.id === playerId) {
      game.player2Score++;
    }

    // Check for win condition
    if (game.player1Score >= 10 || game.player2Score >= 10) {
      game.gameState = 'finished';
    }

    // Update the game state if needed

    // Emit the updated game state to the players
    this.emitGameState(gameId, game);
  }

  private generateGameId(): number {
    // Generate a unique game ID
    // You can use a suitable ID generation mechanism
    // For simplicity, you can use a counter or a random number generator

    return Math.floor(Math.random() * 1000);
  }

  private findGameById(gameId: number): Game {
    // Find the game in the games array based on the game ID
    const game = this.games.find((g) => g.id === gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }

  private emitGameState(gameId: number, game: Game) {
    // Emit the game state to all players in the game room
    // You can use your WebSocket implementation to emit the game state
    // to the connected clients in the game room based on the game ID
  }
}
