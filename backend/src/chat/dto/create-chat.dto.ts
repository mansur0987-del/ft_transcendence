import { IsNotEmpty } from 'class-validator';

export class CreateChatDto {
    @IsNotEmpty()
    chat_name?: string;

    @IsNotEmpty()
    isPrivate?: boolean;

    @IsNotEmpty()
    have_password?: boolean;

    password: string;
}
