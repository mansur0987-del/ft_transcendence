import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat_members } from "../entities/chat_members.entity";
import { UpdateChatDto } from "../dto/update-chat.dto";
import { Chat } from '../entities/chat.entity';

@Injectable()
export class ChatMemberService {
  constructor(@InjectRepository(Chat_members)
  private readonly chat_members_repository: Repository<Chat_members>,
    private readonly chat_repository: Repository<Chat>
  ) { }
  async addRawToChatMembers(
    chat_id: number,
    player_id: number,
    owner_flg: boolean,
    admin_flg: boolean,
    member_flg: boolean,
    banned_to_ts: string,
    muted_to_ts: string):
    Promise<Chat_members> {
    try {
      return await this.chat_members_repository.save({
        chat_id: chat_id,
        player_id: player_id,
        owner_flg: owner_flg,
        admin_flg: admin_flg,
        member_flg: member_flg,
        banned_to_ts: banned_to_ts,
        muted_to_ts: muted_to_ts
      });
    }
    catch (ex) {
      throw new Error(`addRawToChatMembers error: ${ex.message}.`);
    }
  }

  async removeAllByChatId(chat_id: number) {
    const toRemove: Chat_members[] = await this.findAllByChatId(chat_id);
    await this.chat_members_repository.remove(toRemove);
  }

  async removeRawInChatMembers(chat_id: number, player_id: number) {
    const toRemove = this.findAllByIds(chat_id, player_id);
    if (!toRemove) {
      throw new HttpException('Chat_member not found', HttpStatus.NOT_FOUND);
    }
    await this.chat_members_repository.remove(await toRemove);
  }

  async updateRawInChatMembers(actualV: Chat_members, updDto: UpdateChatDto): Promise<Chat_members> {
    if (!updDto.owner_flg)
      updDto.owner_flg = actualV.owner_flg;
    if (!updDto.admin_flg)
      updDto.admin_flg = actualV.admin_flg;
    if (!updDto.member_flg)
      updDto.member_flg = actualV.member_flg;
    if (!updDto.banned_to_ts)
      updDto.banned_to_ts = actualV.banned_to_ts;
    if (!updDto.muted_to_ts)
      updDto.muted_to_ts = actualV.muted_to_ts;
    return await this.chat_members_repository.save(updDto);
  }

  async findAllChatMembers(): Promise<Chat_members[]> {
    return await this.chat_members_repository.find();
  }

  async findOneByIds(chat_id: number, player_id: number): Promise<Chat_members> {
    return await this.chat_members_repository.findOne({ where: { chat_id: chat_id, player_id: player_id } })
  }

  async findAllByIds(chat_id: number, player_id: number): Promise<Chat_members[]> {
    return await this.chat_members_repository.find({ where: { chat_id: chat_id, player_id: player_id } })
  }

  async findAllByChatId(chat_id: number): Promise<Chat_members[]> {
    return await this.chat_members_repository.find({ where: { chat_id: chat_id } })
  }

  async findAllByPlayerId(player_id: number): Promise<Chat_members[]> {
    return await this.chat_members_repository.find({ where: { player_id: player_id } })
  }

  async isMember(chat_id: number, player_id: number): Promise<boolean> {
    let ch: Chat_members = await this.findOneByIds(chat_id, player_id);
    if (!ch)
      return false;
    return (ch.member_flg);
  }

  async isAdm(chat_id: number, player_id: number): Promise<boolean> {
    let ch: Chat_members = await this.findOneByIds(chat_id, player_id);
    if (!ch || !ch.member_flg)
      return false;
    return (ch.admin_flg);
  }

  async isOwner(chat_id: number, player_id: number): Promise<boolean> {
    let ch: Chat_members = await this.findOneByIds(chat_id, player_id);
    if (!ch || !ch.admin_flg || !ch.member_flg)
      return false;
    return (ch.owner_flg);
  }

  async findDirectChatByIdsUsers(user1: number, user2: number): Promise<{ chat_id: number, player_id: number, isMember: boolean }[]> {
    return await this.chat_members_repository.createQueryBuilder()
      .select('members.chat_id, members.player_id, members.member_flg')
      .from(Chat_members, 'members')
      .innerJoin(Chat, 'chat')
      .where('members.chat_id = chat.chat_id')
      .andWhere('chat.isDirect= true')
      .andWhere('members.player_id IN (:user1, :user2)', { user1: user1, user2: user2 }).getRawMany();
  }

  async findAllMutedInChat(chat_id: number): Promise<Chat_members[]> {
    return await this.chat_members_repository.createQueryBuilder()
      .select('chat_id, player_id, owner_flg, admin_flg, member_flg, banned_to_ts, muted_to_ts')
      .from(Chat_members, 'chat_members')
      .where('chat_members.chat_id= :chat_id', { chat_id: chat_id })
      .andWhere('chat_members.muted_to_ts > NOW()').getMany();
  }

  async findAllBannedInChat(chat_id: number): Promise<Chat_members[]> {
    return await this.chat_members_repository.createQueryBuilder()
      .select('chat_id, player_id, owner_flg, admin_flg, member_flg, banned_to_ts, muted_to_ts')
      .from(Chat_members, 'chat_members')
      .where('chat_members.chat_id= :chat_id', { chat_id: chat_id })
      .andWhere('chat_members.banned_to_ts > NOW()').getMany();
  }
}
