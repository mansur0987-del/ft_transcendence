import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	id: number

	@IsNotEmpty()
	username: string;

	@IsNotEmpty()
	password: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;
}
