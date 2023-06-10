import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeChatDto } from './create-type_chat.dto';

export class UpdateTypeChatDto extends PartialType(CreateTypeChatDto) {}
