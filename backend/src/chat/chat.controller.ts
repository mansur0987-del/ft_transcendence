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


@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService,
              private readonly chatMembersService: ChatMemberService)
              {}
  //get
  @Get('/')
  async findAllForUser(): Promise<Chat[]> {
    let result: Chat[] = [];
    let allChats = await this.chatService.findAll();
    for (let i: number = 0; allChats[i]; i++){
      if (!allChats[i].isPrivate || this.chatMembersService.isMember(allChats[i].id, 2)) //fix me: how can i get user id
        result.push(allChats[i]);
    }
    return result;
  }
  
  
  //post
  @Post('/createChannel:id')
  async createNewChannel(@Request() req: any, @Body() src: CreateChatDto): Promise<Chat> {
    if (src.chat_name == undefined || src.isPrivate == undefined || src.have_password == undefined || (src.have_password && src.password == undefined))
      throw new BadRequestException('Validation failed');
    let result = await this.chatService.addRawToChat(src);
    this.chatMembersService.addRawToChatMembers(result.id,
                                                2, //req.user.id, fix me: where i can get user id
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
