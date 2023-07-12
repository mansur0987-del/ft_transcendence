import { IsNotEmpty } from 'class-validator';
import { Chat_members } from "../entities/chat_members.entity";

export class getChatInfoDto {
    @IsNotEmpty()
    chat_name?: string;

    @IsNotEmpty()
    rigths_of_user?: Chat_members;

    @IsNotEmpty()
    users_info?: any[] = [];
}
