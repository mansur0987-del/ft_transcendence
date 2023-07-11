import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Private_messages } from '../entities/private_messages.entity';
import { Repository } from 'typeorm';
import { send } from "process";

@Injectable()
export class privateMessageService {
  constructor(@InjectRepository(Private_messages)
  private readonly private_messages_repository: Repository<Private_messages>
  ) { }

  async addPrivateMessage(sender_id: number, recipient_id: number, message: string, sent_ts: Date):
  Promise<Private_messages>{
    return await this.private_messages_repository.save({
      sender_id: sender_id,
      recipient_id: recipient_id,
      message: message,
      sent_ts: sent_ts
  })
  }

  async findPrivatMessageById(id: number): Promise<Private_messages>{
    return await this.private_messages_repository.findOne({where: {id: id}});
  }

  async findForPlayerByIds(player_id: number, who_id: number): Promise<Private_messages[]> {
    const sentMessages = this.private_messages_repository.find({where: {sender_id: player_id, recipient_id: who_id}});
    const recievedMessages = this.private_messages_repository.find({where: {recipient_id: player_id, sender_id: who_id}});
    let result: Private_messages[] = []
    let i: number, j: number;
    for (i = 0, j = 0; sentMessages[i] && recievedMessages[j];)
    {
      if (sentMessages[i].sent_ts <= recievedMessages[j].sent_ts) {
        result.push(sentMessages[i]);
        i++;
      }
      else {
        result.push(recievedMessages[j]);
        j++;
      }
    }
    for (; sentMessages[i]; i++)
      result.push(sentMessages[i]);
    for (; recievedMessages[j]; j++)
      result.push(recievedMessages[j]);
    return result;
  }
}