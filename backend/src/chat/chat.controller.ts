import { BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Delete,
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
import { UpdateChatDto } from "./dto/update-chat.dto";

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
    if (await this.chatService.findOneByName(src.chat_name))
      throw new BadRequestException('Validation failed: this chat_name is anavaible');
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

  @UseGuards(AuthGuard('jwt'))
  @Post('/joinToChannel')
  async joinToChannel(@Request() req: any, @Body() chat_id: number, @Body() password: string) {
    //check chat 
    const dstChannel = await this.chatService.findOneById(chat_id);
    if (!dstChannel)
      throw new NotFoundException('Channel not found');
    if (dstChannel.isPrivate)
      throw new BadRequestException('Cannot join to private channel');
    if (dstChannel.have_password && dstChannel.password != password)
      throw new ForbiddenException('Bad password');

    //check chat_member
    let chatMemberRaw: Chat_members = await this.chatMembersService.findOneByIds(dstChannel.id, req.userId);
    if (!chatMemberRaw) //new member
      return await this.chatMembersService.addRawToChatMembers(dstChannel.id, req.user.id, false, false, true, new Date(0), new Date(0))
    else //exists member
    {
      if (chatMemberRaw.member_flg)
        throw new NotFoundException('you are already member of this channel');
      if (chatMemberRaw.banned_to_ts >= new Date())
        throw new ForbiddenException('you are banned to :ts', chatMemberRaw.banned_to_ts.toString());
      let updDto: UpdateChatDto = chatMemberRaw;
      updDto.member_flg = true;
      return this.chatMembersService.updateRawInChatMembers(chatMemberRaw, updDto);
    }
  }

  //delete
  @UseGuards(AuthGuard('jwt'))
  @Post('/deleteChannel')
  async removeChannel(@Request() req: any, @Body() body: any) {
    if (!body || !body.chat_id)
      throw new BadRequestException('chat id not found in body')
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Cannot found the channel')
    let who = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!who || !who.owner_flg)
      throw new ForbiddenException('you are not owner of this channel');
    await this.chatMembersService.removeAllByChatId(body.chat_id);
    return await this.chatService.removeRawInChat(body.chat_id);
  }

  // //patch
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto);
  // }
}
