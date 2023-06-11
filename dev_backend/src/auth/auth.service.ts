import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "src/users/dto/creat_user.dto";
import { UsersService } from "src/users/users.service";
import { RegistrationStatus } from "./interfaces/regisration-status.interface";
import { Users_entity } from "src/users/users.entity";
import { authenticator } from "otplib";
import { toDataURL } from 'qrcode';


@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async getAccessToken(userId: number, username: string): Promise<string>{
		const accessToken = this.jwtService.signAsync({
			id: userId,
          	username,
		},
        {
          secret: this.configService.get<string>('JWT_ACCESS_KEY'),
          expiresIn: this.configService.get<string>('EXPIRESIN_ACCESS_KEY'),
        })
		return accessToken;
	}

	async signUp(createUserDto: CreateUserDto): Promise<RegistrationStatus> {
		const userExists = await this.usersService.GetUserByName(createUserDto.username);
		if (userExists){
			const status: RegistrationStatus = {
				success: false,
				statusCode: 400,
				message: 'User already exists',
			};
			return status
		}

		try {
			const newUser = await this.usersService.create(createUserDto);
			//const accessToken = await this.getAccessToken(newUser.id, newUser.username);
			const status: RegistrationStatus = {
					success: true,
					statusCode: 200,
					message: 'User registered',
					person: newUser,
					//data: { accessToken },
				};
			return status

		} catch (err) {
			const status: RegistrationStatus = {
				success: false,
				statusCode: 400,
				message: "User already exists",
			};
		}
	}

	async signIn(username: string, password: string) {
		const userInDb = await this.usersService.GetUserByName(username);
		if (!userInDb) {
			const status: RegistrationStatus = {
				success: false,
				statusCode: 400,
				message: 'User not found',
			}
			return status;
		}

		try {
			await this.usersService.CheckPassword(userInDb, password);
		} catch (err) {
			const status: RegistrationStatus = {
				success: false,
				statusCode: 401,
				message: 'Invalid credentials',
			};
			return status;
		}

		const accessToken = await this.getAccessToken(userInDb.id, userInDb.username);
		const status: RegistrationStatus = {
				success: true,
				statusCode: 200,
				message: 'user: ' + userInDb.username + ' login',
				person: userInDb,
				data: {accessToken},
		};
		return status
	}

	async logout(user : Users_entity) {
		const new_user = this.usersService.update(user, {
			twoFactorAuthenticationSecret: null,
			isTwoFactorAuthenticationEnabled: false
			})

		const status: RegistrationStatus = {
			success: true,
			statusCode: 200,
			person: new_user,
			message: 'user: ' + user.username + ' logout',
		};
		return status;
	}

	async generateTwoFactorAuthenticationSecret(user: Users_entity) {
		const secret = authenticator.generateSecret();

		const otpAuthUrl = authenticator.keyuri(
			user.email,
			'AUTH_APP_NAME',
			secret,
		);

		await this.usersService.setTwoFactorAuthenticationSecret(
			secret,
			user.id,
		);

		return {
			secret,
			otpAuthUrl,
		};
	  }

	async loginWith2fa(userWithoutPsw: Partial<Users_entity>) {
		const payload = {
			username: userWithoutPsw.username,
			email: userWithoutPsw.email,
			isTwoFactorAuthenticationEnabled: !!userWithoutPsw.isTwoFactorAuthenticationEnabled,
			isTwoFactorAuthenticated: true,
		};

		const access_token = await this.jwtService.signAsync(
			{
			id: userWithoutPsw.id,
			username: userWithoutPsw.username,
			},
			{
		  secret: this.configService.get<string>('JWT_2FA_KEY'),
		  expiresIn: this.configService.get<string>('EXPIRESIN_ACCESS_KEY'),
			}
		);

		return {access_token: access_token};
	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: Users_entity) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
	}

	async authenticate(user: Users_entity, twoFactorAuthenticationCode: string) {
		const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode,
			user,
		);

		if (!isCodeValid) {
			const status: RegistrationStatus = {
				success: false,
				statusCode: 401,
				message: 'Wrong authentication code',
			};
			return status;
		}

		await this.usersService.turnOnTwoFactorAuthentication(user.id);

		const data = await this.loginWith2fa(user);

		const status: RegistrationStatus = {
			success: true,
			statusCode: 200,
			message: 'authenticate',
			data: data
		};
		return status;
	}
}
