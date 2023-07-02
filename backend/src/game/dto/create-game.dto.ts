import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGameDTO {
  @IsNumber()
  @IsNotEmpty()
  player1: number;

  @IsNumber()
  @IsNotEmpty()
  player2: number;

  @IsNumber()
  @IsNotEmpty()
  scoreLimit: number;

  @IsString()
  @IsNotEmpty()
  gameType: string;
}
