import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlayersAchievService } from './players_achiev.service';
import { CreatePlayersAchievDto } from './dto/create-players_achiev.dto';
import { UpdatePlayersAchievDto } from './dto/update-players_achiev.dto';

@Controller('players-achiev')
export class PlayersAchievController {
  constructor(private readonly playersAchievService: PlayersAchievService) {}

  @Post()
  create(@Body() createPlayersAchievDto: CreatePlayersAchievDto) {
    return this.playersAchievService.create(createPlayersAchievDto);
  }

  @Get()
  findAll() {
    return this.playersAchievService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersAchievService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlayersAchievDto: UpdatePlayersAchievDto) {
    return this.playersAchievService.update(+id, updatePlayersAchievDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersAchievService.remove(+id);
  }
}
