import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlayersGameService } from './players_game.service';
import { CreatePlayersGameDto } from './dto/create-players_game.dto';
import { UpdatePlayersGameDto } from './dto/update-players_game.dto';

@Controller('players-game')
export class PlayersGameController {
  constructor(private readonly playersGameService: PlayersGameService) {}

  @Post()
  create(@Body() createPlayersGameDto: CreatePlayersGameDto) {
    return this.playersGameService.create(createPlayersGameDto);
  }

  @Get()
  findAll() {
    return this.playersGameService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersGameService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlayersGameDto: UpdatePlayersGameDto,
  ) {
    return this.playersGameService.update(+id, updatePlayersGameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersGameService.remove(+id);
  }
}
