import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayersAchievDto } from './create-players_achiev.dto';

export class UpdatePlayersAchievDto extends PartialType(CreatePlayersAchievDto) {}
