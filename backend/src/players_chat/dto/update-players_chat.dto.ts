import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayersChatDto } from './create-players_chat.dto';

export class UpdatePlayersChatDto extends PartialType(CreatePlayersChatDto) {}
