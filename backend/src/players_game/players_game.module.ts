import { Module } from '@nestjs/common';
import { PlayersGameService } from './players_game.service';
import { PlayersGameController } from './players_game.controller';

@Module({
  controllers: [PlayersGameController],
  providers: [PlayersGameService]
})
export class PlayersGameModule {}
