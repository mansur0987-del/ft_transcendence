import { IsNotEmpty } from 'class-validator';

export class UsernamePasswordDTO {
	@IsNotEmpty()
	readonly username: string;

	@IsNotEmpty()
	readonly password: string;
}
