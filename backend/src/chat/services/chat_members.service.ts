import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat_members } from "../entities/chat_members.entity";

@Injectable()
export class ChatMemberService {
  constructor(@InjectRepository(Chat_members)
  private readonly chat_members_repository: Repository<Chat_members>
  ) { }

  async addRawToChatMembers(chat_id: number, 
                            player_id: number, 
                            owner_flg: boolean, 
                            admin_flg: boolean,
                            member_flg: boolean,
                            banned_to_ts: Date,
                            muted_to_ts: Date):
  Promise<Chat_members>{
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

  async removeRawInChatMembers(chat_id: number, player_id: number) {
    const toRemove = this.findAllByIds(chat_id, player_id);
    if (!toRemove) {
      throw new HttpException('Chat_member not found', HttpStatus.NOT_FOUND);
    }
    await this.chat_members_repository.remove(await toRemove);
  }

  async updateRawInChatMembers(chat_id: number, 
                            player_id: number, 
                            owner_flg: boolean, 
                            admin_flg: boolean,
                            member_flg: boolean,
                            banned_to_ts: Date,
                            muted_to_ts: Date): Promise<Chat_members>{
      this.removeRawInChatMembers(chat_id, player_id);
      return await this.addRawToChatMembers(chat_id, player_id, owner_flg, admin_flg, member_flg, banned_to_ts, muted_to_ts)
  }

  async findAllChatMembers(): Promise<Chat_members[]> {
    return await this.chat_members_repository.find();
  }

  async findOneByIds(chat_id: number, player_id: number): Promise<Chat_members> {
    return await this.chat_members_repository.findOne({where: {chat_id: chat_id, player_id:player_id}})
  }

  async findAllByIds(chat_id: number, player_id: number): Promise<Chat_members[]> {
    return await this.chat_members_repository.find({where: {chat_id: chat_id, player_id:player_id}})
  }

  async findAllByChatId(chat_id: number): Promise<Chat_members[]>{
    return await this.chat_members_repository.find({where: {chat_id: chat_id}})
  }

  async findAllByPlayerId(player_id: number): Promise<Chat_members[]>{
    return await this.chat_members_repository.find({where: {player_id: player_id}})
  }

  async findAllMutedInChat(chat_id: number): Promise<Chat_members[]>{
    return await this.chat_members_repository.createQueryBuilder()
                  .select('chat_id, player_id, owner_flg, admin_flg, member_flg, banned_to_ts, muted_to_ts')
                  .from(Chat_members, 'chat_members')
                  .where('chat_members.chat_id= :chat_id', {chat_id: chat_id})
                  .andWhere('chat_members.muted_to_ts > NOW()').getMany();
  }

  async findAllBannedInChat(chat_id: number): Promise<Chat_members[]>{
    return await this.chat_members_repository.createQueryBuilder()
                  .select('chat_id, player_id, owner_flg, admin_flg, member_flg, banned_to_ts, muted_to_ts')
                  .from(Chat_members, 'chat_members')
                  .where('chat_members.chat_id= :chat_id', {chat_id: chat_id})
                  .andWhere('chat_members.banned_to_ts > NOW()').getMany();
  }
}
