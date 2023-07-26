import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notify } from "./notify.entity";

@Injectable()
export class NotifyService {
  constructor(@InjectRepository(Notify)
  private readonly notifyRep: Repository<Notify>
  ) { }

  async addRawToNotify(all: any): Promise<Notify> {
    return await this.notifyRep.save({
      initiator_id: all.initiator_id,
      initiator_name: all.initiator_name,
      who_id: all.who_id,
      who_name: all.who_name,
      created_at: new Date()
    });
  }

  async deleteRawNotifyByIdRaw(id: number) {
    const toRemove = await this.notifyRep.findOneById(id);
    if (!toRemove)
      return;
    this.notifyRep.remove([toRemove]);
  }

  async changeUserName(user_id: number, newName: string) {
    let toChange = await this.findAllByInitiatorId(user_id);
    for (let i = 0; i < toChange.length; i++) {
      this.notifyRep.update({ id: toChange[i].id }, {
        initiator_name: newName
      })
    }
    toChange = await this.findAllByWhoId(user_id);
    for (let i = 0; i < toChange.length; i++) {
      this.notifyRep.update({ id: toChange[i].id }, {
        who_name: newName
      })
    }
  }

  async findOneByIds(initiator_id: number, who_id: number): Promise<Notify> {
    return await this.notifyRep.findOne({ where: { initiator_id: initiator_id, who_id: who_id } });
  }

  async findOneByNames(initiator_name: string, who_name: string): Promise<Notify> {
    return await this.notifyRep.findOne({ where: { initiator_name: initiator_name, who_name: who_name } });
  }

  async findAllByInitiatorId(initiator_id: number): Promise<Notify[]> {
    return await this.notifyRep.find({ where: { initiator_id: initiator_id } });
  }

  async findAllByWhoId(who_id: number): Promise<Notify[]> {
    return await this.notifyRep.find({ where: { who_id: who_id } });
  }

  async removeAllNotify(toRemove: Notify[]) {
    this.notifyRep.remove(toRemove);
  }
}