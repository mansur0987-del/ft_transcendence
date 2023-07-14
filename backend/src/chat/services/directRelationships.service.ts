import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Direct_R } from "../entities/directRelationship.entity";
import { Repository } from 'typeorm';

@Injectable()
export class directRService {
  constructor(@InjectRepository(Direct_R)
  private readonly directR_repository: Repository<Direct_R>
  ) { }

  async addDirChat(id1: number, id2: number, chat_id: number): Promise<Direct_R>{
    let user1 = id1;
    let user2 = id2;
    if (id2 < id1) {
      user1 = id2;
      user2 = id1;
    }
    return await this.directR_repository.save({
      chat_id: chat_id,
      user_one: user1,
      user_two: user2
    })
  }

  async findDirect_RbyChatId(chat_id: number): Promise<Direct_R>{
    return await this.directR_repository.findOne({where: {chat_id: chat_id}});
  }

  async findDirect_RbyUsers(id1: number, id2: number): Promise<Direct_R>{
    let user1 = id1;
    let user2 = id2;
    if (id2 < id1) {
      user1 = id2;
      user2 = id1;
    }
    return await this.directR_repository.findOne({where: {user_one: user1, user_two: user2}});
  }
}