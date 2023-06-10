import { Module } from '@nestjs/common';
import { PlayersAchievService } from './players_achiev.service';
import { PlayersAchievController } from './players_achiev.controller';

@Module({
  controllers: [PlayersAchievController],
  providers: [PlayersAchievService]
})
export class PlayersAchievModule {}
