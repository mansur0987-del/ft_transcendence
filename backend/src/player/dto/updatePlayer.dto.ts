import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './creatPlayer.dto';
import { IsNotEmpty } from 'class-validator';


export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {
	@IsNotEmpty()
	twoFactorAuthenticationSecret?: string;

	@IsNotEmpty()
	isTwoFactorAuthenticationEnabled?: boolean;

	@IsNotEmpty()
	isLogin?: boolean;

	@IsNotEmpty()
	isLoginFactorAuthentication?: boolean;
}
