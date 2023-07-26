import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlayersChatService } from './players_chat.service';
import { CreatePlayersChatDto } from './dto/create-players_chat.dto';
import { UpdatePlayersChatDto } from './dto/update-players_chat.dto';

@Controller('players-chat')
export class PlayersChatController {
  constructor(private readonly playersChatService: PlayersChatService) {}

  @Post()
  create(@Body() createPlayersChatDto: CreatePlayersChatDto) {
    return this.playersChatService.create(createPlayersChatDto);
  }

  @Get()
  findAll() {
    return this.playersChatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersChatService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlayersChatDto: UpdatePlayersChatDto,
  ) {
    return this.playersChatService.update(+id, updatePlayersChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersChatService.remove(+id);
  }
}
