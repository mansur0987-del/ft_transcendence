import { IsNotEmpty } from 'class-validator';

export class LoginPlayerDto {
	@IsNotEmpty()
	readonly twoFactorAuthenticationCode?: string;
}
