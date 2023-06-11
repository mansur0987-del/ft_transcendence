import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Users_entity } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcrypt';
import { CreateUserDto } from './dto/creat_user.dto';
import { UpdateUserDto } from './dto/update_user.dto';

@Injectable()
export class UsersService {
	constructor (
		@InjectRepository(Users_entity)
	private readonly user_repository: Repository<Users_entity>
	) {}

	// argument: -
	// return: all users
	async GetALL(): Promise<Users_entity[]>{
		return await this.user_repository.find()
	}

	// argument: id_user number
	// return: user where  id_user == user.id or null
	async GetUserById(id: number): Promise<Users_entity>{
		return await this.user_repository.findOneBy({id: id})
	}

	// argument: username string
	// return: user where username == user.username or null
	async GetUserByName(username: string): Promise<Users_entity>{
		const userInDb = await this.user_repository.findOneBy({username: username})
		return userInDb
	}

	// argument: user struct
	// insert in db new user
	// return: new user
	async create(userDto: CreateUserDto): Promise<Users_entity> {
		const { username, password, email } = userDto;

		const userInDb = await this.GetUserByName(username);
		if (userInDb) {
		  throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
		}

		const salt = await genSalt(10);
		const hashPassword = await hash(password, salt);

		await this.user_repository.createQueryBuilder().insert().into(
			Users_entity).values({
				username: username,
				password: hashPassword,
				email: email
			}).execute()

		return await this.GetUserByName(username);
	}

	// argument: user_which_need_update struct, new_struct_user struct
	// update values in db user
	// return: update user
	async update(
		user: Users_entity,
		updateUserDto: UpdateUserDto,
	  ): Promise<Users_entity> {
		try {
			updateUserDto.id = user.id;
			await this.user_repository.save(updateUserDto);
			return await this.GetUserById(updateUserDto.id);
		}
		catch (ex) {
			throw new Error(`Update error: ${ex.message}.`);
		}
	}

	// argument: id_user number
	// delete user by id
	// return: true
	async remove(id: number): Promise<boolean> {
		const userInDb = await this.GetUserById(id);
		if (userInDb) {
		  throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
		}
		await this.user_repository.remove([userInDb])
		return true;
	}

	async CheckPassword(user: Users_entity, password: string): Promise<boolean>{
		const areEqual = await compare(password, user.password);
		if (areEqual == false) {
			throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
		}
		return true;
	}

	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		const userInDb = await this.GetUserById(userId);
		if (!userInDb) {
		  throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
		}
		await this.update(userInDb, {
			twoFactorAuthenticationSecret: secret
		})
	}

	async turnOnTwoFactorAuthentication(userId: number) {
		const userInDb = await this.GetUserById(userId);
		if (!userInDb) {
		  throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
		}
		await this.update(userInDb, {
			isTwoFactorAuthenticationEnabled: true
		})
	}
}
