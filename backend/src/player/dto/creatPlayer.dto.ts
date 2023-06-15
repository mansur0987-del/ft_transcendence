import { IsNotEmpty } from 'class-validator';

export class CreatePlayerDto {
	@IsNotEmpty()
	id?: number

	@IsNotEmpty()
	name: string;
}
