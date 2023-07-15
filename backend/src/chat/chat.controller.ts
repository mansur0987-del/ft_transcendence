import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { Chat_members } from "./entities/chat_members.entity";
import { Chat_messages } from "./entities/chat_messages.entity";
import { Player_blocks } from "./entities/players_blocks.entity";
import { ChatService } from './services/chat.service'
import { ChatMemberService } from "./services/chat_members.service";
import { ChatMessageService } from "./services/chat_message.service";
import { PlayerBlocksService } from "./services/players_blocks.service";
import { Direct_R } from "./entities/directRelationship.entity";
import { directRService } from "./services/directRelationships.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { AuthGuard } from '@nestjs/passport';
import { UpdateChatDto } from "./dto/update-chat.dto";
import * as bcrypt from 'bcrypt';
import { PlayerService } from "src/player/service/player.service";
import { getChatInfoDto } from "./dto/getChatInfo.dto";
import { QueryRunnerProviderAlreadyReleasedError } from "typeorm";

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService,
    private readonly chatMembersService: ChatMemberService,
    private readonly plService: PlayerService,
    private readonly msgService: ChatMessageService,
    private readonly plBlocks: PlayerBlocksService,
    private readonly dirR: directRService
  ) { }

  //utils
  async getHashingPass(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(pass, salt);
  }

  async ts_to_days(src: string): Promise<string> {
    let days: number = ((new Date(src)).getTime() - (new Date()).getTime()) / (1000 * 3600 * 24);
    if (days <= 0)
      return ('0');
    return (days.toFixed(2).toString());
  }

  async getChatMessagesUtil(chat_id: number, user_id: number): Promise<any[]> {
    let result: any[] = [];
    //get all messages from chat
    const allMsg: any[] = await this.msgService.findAllByChatIdInOrder(chat_id);
    for (let i = 0; allMsg && allMsg[i]; i++) {
      if (await this.plBlocks.isBlocked(user_id, allMsg[i].player_id))
        continue;
      if (allMsg[i].player_id == user_id)
        allMsg[i].isOwnerOfMsg = true;
      else
        allMsg[i].isOwnerOfMsg = false;
      //add sender_name
      allMsg[i].sender_name = await this.getUserNameById(allMsg[i].player_id);
      result.push(allMsg[i]);
    }
    return result;
  }

  async defineChatName(src: any, user_id: number): Promise<string> {
    let res = src.chat_name;
    if (src.isDirect) {
      const secondId = await this.dirR.findIdSeconUserDirect(src.id, user_id);
      res += await this.getUserNameById(secondId);
    }
    return res;
  }

  async createDirectChat(user1: number, user2: number): Promise<number> {
    //add new chat in Chat
    const newChat = await this.chatService.addDirectRawToChat();
    //add new chat to directR
    await this.dirR.addDirChat(user1, user2, newChat.id);
    //add users to chat
    await this.chatMembersService.addRawToChatMembers(
      newChat.id,
      user1,
      false,
      false,
      true,
      new Date(0).toISOString(),
      new Date(0).toISOString()
    )
    await this.chatMembersService.addRawToChatMembers(
      newChat.id,
      user2,
      false,
      false,
      true,
      new Date(0).toISOString(),
      new Date(0).toISOString()
    )
    return newChat.id;
  }

  async getUserNameById(user_id: number): Promise<string> {
    const pl = await this.plService.GetPlayerById(user_id);
    if (!pl || !pl.name)
      return 'unknown';
    return pl.name;
  }

  //fix me: delete this
  @Post('/sqlAddUser')
  async execSql(@Body() body: any) {
    await this.chatMembersService.addRawToChatMembers(body.chat_id, body.player_id, body.owner_flg, body.admin_flg, body.member_flg, body.banned_to_ts, body.muted_to_ts);
  }

  //get
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async findAllForUser(@Request() req: any): Promise<any[]> {
    // let result: any[] = [];
    //add public chats
    let allPublic: any[] = await this.chatService.findAllByType(false);
    for (let i: number = 0; allPublic[i]; i++) {
      const selfR = await this.chatMembersService.findOneByIds(allPublic[i].chat_id, req.user.id);
      allPublic[i].isMember = selfR.member_flg;
      allPublic[i].isAdmin = selfR.admin_flg;
      allPublic[i].isOwner = selfR.owner_flg;
      // result.push(await allPublic[i]);
    }
    //add private chats
    let allPrivate: any[] = await this.chatService.findAllByType(true);
    for (let i: number = 0; allPrivate[i]; i++) {
      const selfR = await this.chatMembersService.findOneByIds(allPrivate[i].chat_id, req.user.id);
      if (selfR.member_flg) {
        allPrivate[i].chat_name = await this.defineChatName(allPrivate[i], req.user.id);
        allPrivate[i].isMember = true;
        allPrivate[i].isAdmin = selfR.admin_flg;
        allPrivate[i].isOwner = selfR.owner_flg;
        allPublic.push(await allPrivate[i]);
      }
    }
    return allPublic;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/blockedUsers')
  async getBlockedUsers(@Request() req: any): Promise<any> {
    return await this.plBlocks.findAllByPlayerId(req.user.id);
  }


  //inside chat
  @UseGuards(AuthGuard('jwt'))
  @Post('/sendMessage')
  async sendMessage(@Request() req: any, @Body() body: any): Promise<Chat_messages> {
    if (!body || !body.chat_id || !body.message)
      throw new BadRequestException('not enough data for send message');
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('chat not found');

    let selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.member_flg)
      throw new ForbiddenException('you are not member of this channel');
    if (new Date(selfR.muted_to_ts) > new Date()) {
      const days = this.ts_to_days(selfR.muted_to_ts);
      throw new ForbiddenException({ reason: 'muted', daysExpire: days });
    }
    return await this.msgService.addRawToChatMessage(body.chat_id, req.user.id, body.message, new Date());
  }
  //inside chat
  @UseGuards(AuthGuard('jwt'))
  @Post('/chatInfo')
  async getChatInfo(@Request() req: any, @Body() body: any): Promise<any> {
    console.log('chat id = ', body.chat_id);
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');
    if (body.chat_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id');
    if (!(await this.chatMembersService.isMember(body.chat_id, req.user.id)))
      throw new ForbiddenException('you are not a member of channel');
    let result: getChatInfoDto = new getChatInfoDto;
    //add chat name
    const ChatInfo: Chat = await this.chatService.findOneById(body.chat_id);
    if (!ChatInfo)
      throw new NotFoundException('chat not found');
    result.chat_name = await this.defineChatName(ChatInfo, req.user.id);
    //add relations between query's user and chat
    result.rigths_of_user = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    result.rigths_of_user.banned_to_ts = await this.ts_to_days(result.rigths_of_user.banned_to_ts);
    result.rigths_of_user.muted_to_ts = await this.ts_to_days(result.rigths_of_user.muted_to_ts);
    //add users of chat
    const chatUsers: any[] = await this.chatMembersService.findAllByChatId(body.chat_id);
    for (let i = 0; chatUsers && chatUsers[i]; i++) {
      if (chatUsers[i].member_flg) {
        chatUsers[i].user_name = await this.getUserNameById(chatUsers[i].player_id);
        chatUsers[i].banned_to_ts = await this.ts_to_days(chatUsers[i].banned_to_ts);
        chatUsers[i].muted_to_ts = await this.ts_to_days(chatUsers[i].muted_to_ts);
        result.users_info.push(chatUsers[i]);
      }
    }
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/getBannedUsers')
  async getBannedUsers(@Request() req: any, @Body() body: any): Promise<any> {
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');

    if (body.chat_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id');

    //check channel exists
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check is adm
    if (!this.chatMembersService.isAdm(body.chat_id, req.user.id))
      throw new ForbiddenException('You are not adm or owner in this chat');

    let result: any[] = [];
    let allR: any = await this.chatMembersService.findAllByChatId(body.chat_id);
    for (let i = 0; allR[i]; i++) {
      if (new Date(allR[i].banned_to_ts) > new Date()) {
        allR[i].name = await this.getUserNameById(allR[i].player_id);
        allR[i].banned_to_ts = await this.ts_to_days(allR[i].banned_to_ts);
        allR[i].muted_to_ts = await this.ts_to_days(allR[i].muted_to_ts);
        result.push(allR[i]);
      }
    }
    return (result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/kickUser')
  async kickUser(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');

    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id');

    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check owner
    const selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.admin_flg)
      throw new ForbiddenException('You are not adm or owner in this chat');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || !actualR.member_flg)
      throw new NotFoundException('Player not found in chat');

    if (actualR.owner_flg || (actualR.admin_flg && !selfR.owner_flg))
      throw new ForbiddenException('your rigths in this channel equal or less then user which you want to mute');

    let newR: UpdateChatDto = actualR;
    newR.admin_flg = false;
    newR.member_flg = false;
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/getChatMessages')
  async getChatMessagesForUser(@Request() req: any, @Body() body: any): Promise<any[]> {
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');
    if (body.chat_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id');
    //check channel exists
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check is member
    if (!this.chatMembersService.isMember(body.chat_id, req.user.id))
      throw new ForbiddenException('You are not in this chat');
    return await this.getChatMessagesUtil(body.chat_id, req.user.id);
  }

  //post
  @UseGuards(AuthGuard('jwt'))
  @Post('/createChannel')
  async createNewChannel(@Request() req: any, @Body() src: CreateChatDto): Promise<Chat> {
    if (await this.chatService.findOneByName(src.chat_name))
      throw new BadRequestException('Validation failed: this chat_name is anavaible');
    if (src.chat_name.substring(0, 6) == 'direct')
      throw new ForbiddenException('you cannot use direct keyword in start of chat_name');
    console.log(src.chat_name);
    if (src.have_password)
      src.password = await this.getHashingPass(src.password)
    let result = await this.chatService.addRawToChat(src);
    this.chatMembersService.addRawToChatMembers(
      result.id,
      req.user.id,
      true,
      true,
      true,
      new Date(0).toISOString(),
      new Date(0).toISOString());
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/enterDirectChannel')
  async enterDirectChannel(@Request() req: any, @Body() body: any): Promise<{ chat_id: number }> {
    if (!body || !body.player_name)
      throw new BadRequestException('INVALID BODY');

    const pl = await this.plService.GetPlayerByName(body.player_name);
    if (!pl)
      throw new NotFoundException('player not found');

    if (await this.plBlocks.isBlocked(pl.id, req.user.id))
      throw new ForbiddenException('player blocked you');
    //check R exists
    const dirChat = await this.dirR.findDirect_RbyUsers(req.user.id, pl.id);
    let chat_id: number;
    if (!dirChat)
      chat_id = await this.createDirectChat(req.user.id, pl.id)
    else
      chat_id = dirChat.chat_id;
    const selfR = await this.chatMembersService.findOneByIds(chat_id, req.user.id);
    if (!selfR.member_flg) {
      let newSelfR = selfR;
      newSelfR.member_flg = true;
      await this.chatMembersService.updateRawInChatMembers(selfR, newSelfR);
    }
    return { chat_id: chat_id };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/joinToChannel')
  async joinToChannel(@Request() req: any, @Body() body: any) {
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');
    if (body.chat_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id');
    //check chat 
    const dstChannel = await this.chatService.findOneById(body.chat_id);
    if (!dstChannel)
      throw new NotFoundException('Channel not found');
    if (dstChannel.isPrivate)
      throw new BadRequestException('Cannot join to private channel');
    if (dstChannel.have_password && (!body.password || !await bcrypt.compare(body.password, dstChannel.password)))
      throw new ForbiddenException('Bad password');

    //check chat_member
    let chatMemberRaw: Chat_members = await this.chatMembersService.findOneByIds(dstChannel.id, req.user.id);
    if (!chatMemberRaw) //new member
      return await this.chatMembersService.addRawToChatMembers(dstChannel.id, req.user.id, false, false, true, new Date(0).toISOString(), new Date(0).toISOString());
    else //exists member
    {
      if (chatMemberRaw.member_flg)
        throw new BadRequestException('you are already member of this channel');
      if (new Date(chatMemberRaw.banned_to_ts) > new Date())
        throw new ForbiddenException('your BAN expires in ' + await this.ts_to_days(chatMemberRaw.banned_to_ts) + ' days!');
      let updDto: UpdateChatDto = chatMemberRaw;
      updDto.member_flg = true;
      let result = await this.chatMembersService.updateRawInChatMembers(chatMemberRaw, updDto);
      result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
      result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
      return result;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/setAdmin')
  async setUserAsAdm(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');
    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id');
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
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/unsetAdmin')
  async unsetUserAsAdm(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');
    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id');
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
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/leaveChannel')
  async leaveChannel(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id)
      throw new BadRequestException('have no body or chat_id in body');
    if (body.chat_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id');
    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!actualR || !actualR.member_flg)
      throw new NotFoundException('You are not member of this channel');
    //check owner
    if (actualR.owner_flg)
      throw new ForbiddenException('you must set another owner before leave channel');
    let newR: UpdateChatDto = actualR;
    newR.admin_flg = false;
    newR.member_flg = false;
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/muteUser')
  async muteUser(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_id || !body.days)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');
    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber || body.days.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id/days');
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

    let newDate: Date = new Date();
    newDate.setDate(newDate.getDate() + body.days);
    let newR: UpdateChatDto = actualR;
    newR.muted_to_ts = newDate.toISOString();
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/unmuteUser')
  async unMuteUser(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');
    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id');
    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.admin_flg)
      throw new ForbiddenException('you cannot unmute users in this channel');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || new Date(actualR.muted_to_ts) <= new Date())
      throw new NotFoundException('Player not mute in chat');

    let newDate: Date = new Date();
    newDate.setDate(newDate.getDate() - 1);
    let newR: UpdateChatDto = actualR;
    newR.muted_to_ts = newDate.toISOString();
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/banUser')
  async banUser(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_id || !body.days)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');
    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber || body.days.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id/days');
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
    newR.banned_to_ts = newDate.toISOString();
    newR.admin_flg = false;
    newR.member_flg = false;
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/unbanUser')
  async unBanUser(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id/days_id in body');
    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id');
    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    const selfR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfR || !selfR.admin_flg)
      throw new ForbiddenException('you cannot unban users in this channel');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || new Date(actualR.banned_to_ts) <= new Date())
      throw new NotFoundException('Player not banned in this channel');

    let newDate: Date = new Date();
    newDate.setDate(newDate.getDate() - 1);
    let newR: UpdateChatDto = actualR;
    newR.banned_to_ts = newDate.toISOString();
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('/setOwner')
  async setOwner(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_id)
      throw new BadRequestException('have no body or chat_id/player_id in body');
    if (body.chat_id.IsNotNumber || body.player_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id/player_id');
    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check owner
    const selfActualR = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!selfActualR || !selfActualR.owner_flg)
      throw new ForbiddenException('you are not owner of channel');

    const actualR = await this.chatMembersService.findOneByIds(body.chat_id, body.player_id);
    if (!actualR || !actualR.member_flg)
      throw new NotFoundException('Player not found in chat');
    if (actualR.owner_flg)
      throw new BadRequestException('Player is already owner of channel');
    let newSelfR: UpdateChatDto = selfActualR;
    newSelfR.owner_flg = false;
    await this.chatMembersService.updateRawInChatMembers(selfActualR, newSelfR);
    let newR: UpdateChatDto = actualR;
    newR.admin_flg = true;
    newR.owner_flg = true;
    let result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  //fix me: delete this
  // @Get('/addUserTest')
  // async addUserATest(): Promise<Chat_members>{
  //   const pl = await this.plService.GetPlayerByName('www');
  //   if (!pl)
  //     throw new NotFoundException('User not found');
  //   let actualR: Chat_members = await this.chatMembersService.findOneByIds(body.chat_id, pl.id);
  //   if (!actualR)
  //     return await this.chatMembersService.addRawToChatMembers(
  //       1,
  //       body.player_id,
  //       false,
  //       false,
  //       true,
  //       new Date(0).toISOString(),
  //       new Date(0).toISOString());
  // }

  @UseGuards(AuthGuard('jwt'))
  @Post('/addUser')
  async addMember(@Request() req: any, @Body() body: any): Promise<Chat_members> {
    //check body exists
    if (!body || !body.chat_id || !body.player_name)
      throw new BadRequestException('have no body or chat_id / player_id in body');
    if (body.chat_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id');
    //check exists chat
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Channel not found');

    //check adm
    if (!(await this.chatMembersService.isAdm(body.chat_id, req.user.id)))
      throw new ForbiddenException('you are not admin of this channel');

    //find player
    const pl = await this.plService.GetPlayerByName(body.player_name);
    if (!pl)
      throw new NotFoundException('User not found');
    let actualR: Chat_members = await this.chatMembersService.findOneByIds(body.chat_id, pl.id);
    if (!actualR)
      return await this.chatMembersService.addRawToChatMembers(
        body.chat_id,
        pl.id,
        false,
        false,
        true,
        new Date(0).toISOString(),
        new Date(0).toISOString());

    if (new Date(actualR.banned_to_ts) > new Date()) {
      const expireDays = ((new Date(actualR.banned_to_ts)).getTime() - (new Date()).getTime()) / (1000 * 3600 * 24);
      throw new ForbiddenException('player\'s BAN expires in ' + expireDays.toFixed(2).toString() + ' days!');
    }
    let result = actualR;
    if (!actualR.member_flg) {
      let newR: UpdateChatDto = actualR;
      newR.member_flg = true;
      result = await this.chatMembersService.updateRawInChatMembers(actualR, newR);
    }
    result.banned_to_ts = await this.ts_to_days(result.banned_to_ts);
    result.muted_to_ts = await this.ts_to_days(result.muted_to_ts);
    return result;
  }

  //delete
  @UseGuards(AuthGuard('jwt'))
  @Post('/deleteChannel')
  async removeChannel(@Request() req: any, @Body() body: any) {
    if (!body || !body.chat_id)
      throw new BadRequestException('chat id not found in body')
    if (body.chat_id.IsNotNumber)
      throw new BadRequestException('invalid chat_id');
    if (!(await this.chatService.findOneById(body.chat_id)))
      throw new NotFoundException('Cannot found the channel')
    let who = await this.chatMembersService.findOneByIds(body.chat_id, req.user.id);
    if (!who || !who.owner_flg)
      throw new ForbiddenException('you are not owner of this channel');
    await this.chatMembersService.removeAllByChatId(body.chat_id);
    return await this.chatService.removeRawInChat(body.chat_id);
  }
}
