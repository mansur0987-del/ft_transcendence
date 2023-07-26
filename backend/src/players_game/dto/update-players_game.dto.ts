import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayersGameDto } from './create-players_game.dto';

export class UpdatePlayersGameDto extends PartialType(CreatePlayersGameDto) {}
