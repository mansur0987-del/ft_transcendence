import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './creatPlayer.dto';
import { IsNotEmpty } from 'class-validator';
import { PlayerEntity } from '../entities/player.entity';


export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {
	@IsNotEmpty()
	twoFactorAuthenticationSecret?: string;

	@IsNotEmpty()
	isTwoFactorAuthenticationEnabled?: boolean;

	@IsNotEmpty()
	isLogin?: boolean;

	@IsNotEmpty()
	isLoginFactorAuthentication?: boolean;

	@IsNotEmpty()
	isFirstGame?: boolean;

	@IsNotEmpty()
	isFirstWin?: boolean;

	@IsNotEmpty()
	status?: number;

	@IsNotEmpty()
	myFriends?: PlayerEntity[]
}
