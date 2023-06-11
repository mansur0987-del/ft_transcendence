import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './creat_user.dto';
import { IsNotEmpty } from 'class-validator';


export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsNotEmpty()
	twoFactorAuthenticationSecret?: string;

	@IsNotEmpty()
	isTwoFactorAuthenticationEnabled?: boolean;
}
