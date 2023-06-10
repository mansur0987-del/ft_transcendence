import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeChatService } from './type_chat.service';
import { CreateTypeChatDto } from './dto/create-type_chat.dto';
import { UpdateTypeChatDto } from './dto/update-type_chat.dto';

@Controller('type-chat')
export class TypeChatController {
  constructor(private readonly typeChatService: TypeChatService) {}

  @Post()
  create(@Body() createTypeChatDto: CreateTypeChatDto) {
    return this.typeChatService.create(createTypeChatDto);
  }

  @Get()
  findAll() {
    return this.typeChatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeChatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeChatDto: UpdateTypeChatDto) {
    return this.typeChatService.update(+id, updateTypeChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeChatService.remove(+id);
  }
}
