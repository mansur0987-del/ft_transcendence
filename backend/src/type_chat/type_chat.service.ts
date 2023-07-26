import { Injectable } from '@nestjs/common';
import { CreateTypeChatDto } from './dto/create-type_chat.dto';
import { UpdateTypeChatDto } from './dto/update-type_chat.dto';

@Injectable()
export class TypeChatService {
  [x: string]: any;
  create(createTypeChatDto: CreateTypeChatDto) {
    return 'This action adds a new typeChat';
  }

  findAll() : string {
    return this.typeChatService.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} typeChat`;
  }

  update(id: number, updateTypeChatDto: UpdateTypeChatDto) {
    return `This action updates a #${id} typeChat`;
  }

  remove(id: number) {
    return `This action removes a #${id} typeChat`;
  }
}
