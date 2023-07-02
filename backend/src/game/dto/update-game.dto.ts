import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateGameDTO {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;

  @IsNumber()
  @IsNotEmpty()
  player1Score: number;

  @IsNumber()
  @IsNotEmpty()
  player2Score: number;
}
