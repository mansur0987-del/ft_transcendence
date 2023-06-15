import { IsNotEmpty } from 'class-validator';

export class LoginPlayerDto {
	@IsNotEmpty()
	readonly name: string;

	@IsNotEmpty()
	readonly twoFactorAuthenticationCode?: string;
}
