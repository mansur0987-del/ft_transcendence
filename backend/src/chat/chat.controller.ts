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
import { AuthGuard } from '@nestjs/passport';
import { UpdateChatDto } from "./dto/update-chat.dto";
import * as bcrypt from 'bcrypt';
import { PlayerService } from "src/player/service/player.service";
import { getChatInfoDto } from "./dto/getChatInfo.dto";


@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService,
              private readonly chatMembersService: ChatMemberService,
              private readonly plService: PlayerService,
              private readonly msgService: ChatMessageService,
              private readonly plBlocks: PlayerBlocksService
              )
              {}

  //utils
  async getHashingPass(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(pass, salt);
  }

  //get
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async findAllForUser(@Request() req: any): Promise<Chat[]> {
    let result: any[] = [];
    //add public chats
    let allPublic: any[] = await this.chatService.findAllByType(false);
    for (let i: number = 0; allPublic[i]; i++) {
      allPublic[i].isMember = await this.chatMembersService.isMember(allPublic[i].id, req.user.id);
      allPublic[i].isAdmin = await this.chatMembersService.isAdm(allPublic[i].id, req.user.id);
      allPublic[i].isOwner = await this.chatMembersService.isOwner(allPublic[i].id, req.user.id);
      result.push(await allPublic[i]);
    }
    //add privat chats
    let allPrivate: any[] = await this.chatService.findAllByType(true);
    for (let i: number = 0; allPrivate[i]; i++){
      if (await this.chatMembersService.isMember(allPrivate[i].id, req.user.id)) {
        allPrivate[i].isMember = true;
        allPrivate[i].isAdmin = await this.chatMembersService.isAdm(allPrivate[i].id, req.user.id);
        allPrivate[i].isOwner = await this.chatMembersService.isOwner(allPrivate[i].id, req.user.id);
        result.push(await allPrivate[i]);
      }
    }
    return result;
  }
  
  //inside chat
  @UseGuards(AuthGuard('jwt'))
  @Post('/chatInfo')
  async getChatInfo(@Request() req: any, @Body() body: any): Promise<any> {
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');
    if (!(await this.chatMembersService.isMember(body.chat_id, req.user.id)))
      throw new ForbiddenException('you are not a member of channel');
    let result: getChatInfoDto = new getChatInfoDto;
    //add chat name
    const ChatInfo: Chat = await this.chatService.findOneById(body.chat_id);
    if (!ChatInfo || !ChatInfo.chat_name)
      throw new NotFoundException('chat not found');
    result.chat_name = ChatInfo.chat_name;
    //add relations between query's user and chat
    result.rigths_of_user = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    
    //add users of chat
    const chatUsers: any[] = await this.chatMembersService.findAllByChatId(body.chat_id);
    for (let i = 0; chatUsers && chatUsers[i]; i++) {
      if (chatUsers[i].member_flg) {
        chatUsers[i].user_name = (await this.plService.GetPlayerById(chatUsers[i].player_id)).name;
        result.users_info.push(chatUsers[i]);
      }
    }
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/getBannedUsers')
  async getBannedUsers(@Request() req: any, @Body() body: any): Promise<any>{
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');

    //check channel exists
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');
    
    //check is adm
    if (!this.chatMembersService.isAdm(body.chat_id, req.user.id))
      throw new ForbiddenException('You are not adm or owner in this chat');

    let result: any[] = [];
    let allR: any = await this.chatMembersService.findAllByChatId(body.chat_id);
    for (let i = 0; allR[i]; i++){
      if (allR[i].banned_to_ts > new Date()){
        allR[i].name = (await this.plService.GetPlayerById(allR[i].player_id)).name;
        result.push(allR[i]);
      }
    }
    return (result);
  }
  //fix me: add kick user
  @UseGuards(AuthGuard('jwt'))
  @Post('/getChatMessages')
  async getChatMessagesForUser(@Request() req: any, @Body() body: any): Promise<any>{
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');
    
    //check channel exists
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check is member
    if (!this.chatMembersService.isMember(body.chat_id, req.user.id))
      throw new ForbiddenException('You are not in this chat');

    let result: any[] = [];
    //get all messages from chat
    const allMsg: any[] = await this.msgService.findAllByChatIdInOrder(body.chat_id);
    for (let i = 0; allMsg && allMsg[i]; i++){
      if (await this.plBlocks.isBlocked(req.user.id, allMsg[i].player_id))
        continue;
      if (allMsg[i].player_id == req.user.id)
        allMsg[i].isOwnerOfMsg = true;
      else
        allMsg[i].isOwnerOfMsg = false;
      result.push(allMsg[i]);
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
    if (src.have_password)
      src.password = await this.getHashingPass(src.password)
    let result = await this.chatService.addRawToChat(src);
    this.chatMembersService.addRawToChatMembers(
      result.id,
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
  async joinToChannel(@Request() req: any, @Body() body: any) {
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');
    //check chat 
    const dstChannel = await this.chatService.findOneById(body.chat_id);
    if (!dstChannel)
      throw new NotFoundException('Channel not found');
    if (dstChannel.isPrivate)
      throw new BadRequestException('Cannot join to private channel');
    if (dstChannel.have_password && (!body.password || !await bcrypt.compare(body.password, dstChannel.password)))
      throw new ForbiddenException('Bad password');

    //check chat_member
    let chatMemberRaw: Chat_members = await this.chatMembersService.findOneByIds(dstChannel.id, req.userId);
    if (!chatMemberRaw) //new member
      return await this.chatMembersService.addRawToChatMembers(dstChannel.id, req.user.id, false, false, true, new Date(0), new Date(0));
    else //exists member
    {
      if (chatMemberRaw.member_flg)
        throw new BadRequestException('you are already member of this channel');
      if (chatMemberRaw.banned_to_ts > new Date()) {
        const expireDays = (chatMemberRaw.banned_to_ts.getTime() - (new Date()).getTime()) / (1000 * 3600 * 24);
        throw new ForbiddenException('your BAN expires in ' + expireDays.toString() + ' days!');
      }
      let updDto: UpdateChatDto = chatMemberRaw;
      updDto.member_flg = true;
      return this.chatMembersService.updateRawInChatMembers(chatMemberRaw, updDto);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/setAdmin')
  async setUserAsAdm(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');
    
    //check owner
    if (!(await this.chatMembersService.isOwner(body.chat_id, req.user.id)))
      throw new ForbiddenException('you are not owner of channel');
    
    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || !actualR.member_flg)
      throw new NotFoundException('Player not found in chat');
    if (actualR.admin_flg)
      throw new BadRequestException('Player is already admin of channel');
    let newR: UpdateChatDto = actualR;
    newR.admin_flg = true;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/unsetAdmin')
  async unsetUserAsAdm(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check owner
    if (!(await this.chatMembersService.isOwner(body.chat_id, req.user.id)))
      throw new ForbiddenException('you are not owner of this channel');
    
    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR.member_flg)
      throw new NotFoundException('Player not found in chat');
    if (!actualR.admin_flg)
      throw new BadRequestException('Player is not admin of this channel');
    let newR: UpdateChatDto = actualR;
    newR.admin_flg = false;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/leaveChannel')
  async leaveChannel(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || !actualR.member_flg)
      throw new NotFoundException('You are not member of this channel');
    //check owner
    if (actualR.owner_flg)
      throw new ForbiddenException('you must set another owner before leave channel');
    let newR: UpdateChatDto = actualR;
    newR.admin_flg = false;
    newR.member_flg = false;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/muteUser')
  async muteUser(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id || !body.days)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.admin_flg)
      throw new ForbiddenException('you cannot mute users in this channel');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR)
      throw new NotFoundException('Player not found in chat');

    if (actualR.owner_flg || (actualR.admin_flg && !selfR.owner_flg))
      throw new ForbiddenException('your rigths in this channel equal or less then user which you want to mute');
    
    let newR: UpdateChatDto = actualR;
    newR.muted_to_ts = new Date() + body.days;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/unmuteUser')
  async unMuteUser(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.admin_flg)
      throw new ForbiddenException('you cannot unmute users in this channel');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || actualR.muted_to_ts <= new Date())
      throw new NotFoundException('Player not found in chat');
    
    let newDate: Date = new Date();
    newDate.setDate(newDate.getDate() - 1);
    let newR: UpdateChatDto = actualR;
    newR.muted_to_ts = newDate;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/banUser')
  async banUser(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id || !body.days)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.admin_flg)
      throw new ForbiddenException('you cannot ban users in this channel');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR)
      throw new NotFoundException('Player not found in chat');

    if (actualR.owner_flg || (actualR.admin_flg && !selfR.owner_flg))
      throw new ForbiddenException('your rigths in this channel equal or less then user which you want to ban');
    
    let newDate: Date = new Date();
    newDate.setDate(newDate.getDate() + body.days);
    let newR: UpdateChatDto = actualR;
    newR.banned_to_ts = newDate;
    //fix me: add kick
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/unbanUser')
  async unBanUser(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.admin_flg)
      throw new ForbiddenException('you cannot unban users in this channel');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || actualR.banned_to_ts <= new Date())
      throw new NotFoundException('Player not banned in this channel');

    let newDate: Date = new Date();
    newDate.setDate(newDate.getDate() - 1);
    let newR: UpdateChatDto = actualR;
    newR.banned_to_ts = newDate;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('/setOwner')
  async setOwner(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check owner
    const selfActualR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfActualR || !selfActualR.owner_flg)
      throw new ForbiddenException('you are not owner of channel');
    
    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR.member_flg)
      throw new NotFoundException('Player not found in chat');
    if (actualR.owner_flg)
      throw new BadRequestException('Player is already owner of channel');
    let newSelfR: UpdateChatDto = selfActualR;
    newSelfR.owner_flg = false;
    await this.chatMembersService.updateRawInChatMembers(selfActualR, newSelfR);
    let newR: UpdateChatDto = actualR;
    newR.admin_flg = true;
    newR.owner_flg = true;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/addMember')
  async addMember(@Request() req: any, @Body() body: any): Promise<Chat_members>{
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');
    
    //check adm
    if (!(await this.chatMembersService.isAdm(body.chat_id, req.user.id)))
      throw new ForbiddenException('you are not admin of this channel');
    
    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR)
      return await this.chatMembersService.addRawToChatMembers(
        body.chat_id,
        body.player_id,
        false,
        false,
        true,
        new Date(0),
        new Date(0));
    if (actualR.banned_to_ts > new Date()) {
        const expireDays = (actualR.banned_to_ts.getTime() - (new Date()).getTime()) / (1000 * 3600 * 24);
        throw new ForbiddenException('player\'s BAN expires in ' + expireDays.toString() + ' days!');
    }
    if (actualR.member_flg)
      throw new BadRequestException('Player is already member of this channel');
    let newR: UpdateChatDto = actualR;
    newR.member_flg = true;
    return await this.chatMembersService.updateRawInChatMembers(actualR, newR);
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
