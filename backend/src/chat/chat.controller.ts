import { BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Request,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { Chat_members } from "./entities/chat_members.entity";
import { Chat_messages } from "./entities/chat_messages.entity";
import { Player_blocks } from "./entities/players_blocks.entity";
import { ChatService } from './services/chat.service'
import { ChatMemberService } from "./services/chat_members.service";
import { ChatMessageService } from "./services/chat_message.service";
import { PlayerBlocksService } from "./services/players_blocks.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { PlayerService } from "src/player/service/player.service";
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService,
              private readonly chatMembersService: ChatMemberService)
              {}
  //get
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async findAllForUser(@Request() req: any): Promise<Chat[]> {
    let result: Chat[] = await this.chatService.findAllByType(false);
    let allPrivate: Chat[] = await this.chatService.findAllByType(true);
    for (let i: number = 0; allPrivate[i]; i++){
      if (await this.chatMembersService.isMember(allPrivate[i].id, req.user.id)) 
        result.push(allPrivate[i]);
    }
    return result;
  }
  
  
  //post
  @UseGuards(AuthGuard('jwt'))
  @Post('/createChannel')
  async createNewChannel(@Request() req: any, @Body() src: CreateChatDto): Promise<Chat> {
    if (src.chat_name == undefined || src.isPrivate == undefined || src.have_password == undefined || (src.have_password && src.password == undefined))
      throw new BadRequestException('Validation failed');
    let result = await this.chatService.addRawToChat(src);
    this.chatMembersService.addRawToChatMembers(result.id,
                                                req.user.id,
                                                true,
                                                true,
                                                true,
                                                new Date(0),
                                                new Date(0));
    return result;
  }

  //delete
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.chatService.removeRawInChat(+id);
  // }

  // //patch
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto);
  // }
}
