import { IsNotEmpty } from 'class-validator';

export class UpdateChatDto {
    @IsNotEmpty()
    id?: number;

    @IsNotEmpty()
    chat_id?: number;

    @IsNotEmpty()
    player_id?: number;

    owner_flg: boolean;
    admin_flg: boolean;
    member_flg: boolean;
    banned_to_ts: Date;
    muted_to_ts: Date;
}
