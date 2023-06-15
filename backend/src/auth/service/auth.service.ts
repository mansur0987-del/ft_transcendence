import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CreatePlayerDto } from "src/player/dto/creatPlayer.dto";
import { PlayerService } from "src/player/service/player.service";
import { ReturnStatus } from "../interfaces/return.interface";
import { PlayerEntity } from "src/player/entities/player.entity";
import { authenticator } from "otplib";
import { toDataURL } from 'qrcode';
import { LoginPlayerDto } from "src/player/dto/loginPlayer.dto";
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';


@Injectable()
export class AuthService {
	constructor(
		private readonly playerService: PlayerService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {}

	async login(res: any){
		const api_42 = 'https://api.intra.42.fr/oauth/authorize';
		const client_id = 'client_id=' + process.env.UID_42;
		const redirect_uri = 'redirect_uri=' + process.env.REDIRECT_URI;
		const response_type = 'response_type=code';
		const scope = 'scope=public'
		const redirect = api_42 + '?' + client_id + '&' + scope +  '&' + redirect_uri + '&' + response_type
		res.redirect(redirect)
	}

	async callback(code : string){
		const url_42 = 'https://api.intra.42.fr/oauth/token'
		const body = {
			grant_type: 'authorization_code',
			client_id: process.env.UID_42,
			client_secret: process.env.FR_42_SECRET,
			code: code,
			redirect_uri: process.env.REDIRECT_URI
		}

		const getUserToken = await this.httpService.post(url_42, body);
		const lastValueUserToken = await lastValueFrom(getUserToken)

		const header = {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + lastValueUserToken.data.access_token,
		}
		const GetUserInfo = await this.httpService.get('https://api.intra.42.fr/v2/me', {headers: header})
		const lastValueUserInfo = await lastValueFrom(GetUserInfo)

		const userInfo : CreatePlayerDto = {
			name: lastValueUserInfo.data.login,
		}

		const userInDB = await this.signUp({name: lastValueUserInfo.data.login});
		const accessToken = await this.getAccessToken(userInDB.id, userInDB.name);

		const user = await this.signIn(userInDB, accessToken)
		console.log('user')
		console.log(user)
		return user
	}

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

	async signUp(createPlayerDto: CreatePlayerDto): Promise<PlayerEntity> {
		const userInDb = await this.playerService.GetPlayerByName(createPlayerDto.name);
		if (userInDb)
			return userInDb

		console.log('createPlayerDto')
		console.log(createPlayerDto)
		const newUser = await this.playerService.create(createPlayerDto);
		return newUser;
	}

	async signIn(user: LoginPlayerDto, accessToken: string) {
		const userInDb = await this.playerService.GetPlayerByName(user.name);
		if (userInDb.isTwoFactorAuthenticationEnabled){
			if (!user.twoFactorAuthenticationCode){
				const status: ReturnStatus = {
					success: false,
					statusCode: 401,
					message: 'code 2fa is null',
				};
				return status;
			}

			const isCodeValid = authenticator.verify({
				token: user.twoFactorAuthenticationCode,
				secret: userInDb.twoFactorAuthenticationSecret,
			});
			if (!isCodeValid) {
				const status: ReturnStatus = {
					success: false,
					statusCode: 401,
					message: 'Wrong authentication code 2fa',
				};
				return status;
			}
			await this.playerService.update(userInDb, {isLoginFactorAuthentication : true})
		}

		const update_user = await this.playerService.update(userInDb, {isLogin : true})

		const status: ReturnStatus = {
				success: true,
				statusCode: 200,
				message: 'user: ' + update_user.name + ' login',
				person: update_user,
				data: {accessToken},
		};
		return status
	}

	async logout(user : PlayerEntity) : Promise<ReturnStatus> {
		const update_user = await this.playerService.update(user, {
			isLogin : false,
			isLoginFactorAuthentication : false
		})

		const status: ReturnStatus = {
			success: true,
			statusCode: 200,
			person: user,
			message: 'user: ' + update_user.name + ' logout',
		};
		return status;
	}

	async turn_off (user: PlayerEntity, twoFactorAuthenticationCode: string) : Promise<ReturnStatus> {
		if (twoFactorAuthenticationCode == null || user.twoFactorAuthenticationSecret == null){
			const status: ReturnStatus = {
				success: false,
				statusCode: 401,
				message: 'twoFactorAuthenticationCode or user.twoFactorAuthenticationSecret is null',
			};
			return status;
		}

		const isCodeValid = authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
		if (!isCodeValid) {
			const status: ReturnStatus = {
				success: false,
				statusCode: 401,
				message: 'Wrong authentication code',
			};
			return status;
		}

		const new_user = await this.playerService.update(user, {
			twoFactorAuthenticationSecret: null,
			isTwoFactorAuthenticationEnabled: false,
			isLoginFactorAuthentication: false,
			})

		const status: ReturnStatus = {
			success: true,
			statusCode: 200,
			person: new_user,
			message: 'user: ' + user.name + ' turn off 2fa',
		};
		return status;
	}

	async register(user: PlayerEntity, res: any) : Promise<ReturnStatus> {
		const { secret, otpAuthUrl } = await this.generateTwoFactorAuthenticationSecret(user);
		await this.playerService.update(
			user,
			{twoFactorAuthenticationSecret: secret}
		)

		return res.json(await toDataURL(otpAuthUrl))
	}

	async generateTwoFactorAuthenticationSecret(user: PlayerEntity) {
		const secret = authenticator.generateSecret();

		const otpAuthUrl = authenticator.keyuri(
			user.name,
			'ft_transcendance',
			secret,
		);

		return {
			secret,
			otpAuthUrl,
		};
	  }

	async authenticate(user: PlayerEntity, twoFactorAuthenticationCode: string) : Promise<ReturnStatus> {
		if (twoFactorAuthenticationCode == null || user.twoFactorAuthenticationSecret == null){
			const status: ReturnStatus = {
				success: false,
				statusCode: 401,
				message: 'twoFactorAuthenticationCode or user.twoFactorAuthenticationSecret is null',
			};
			return status;
		}

		const isCodeValid = authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});

		if (!isCodeValid) {
			const status: ReturnStatus = {
				success: false,
				statusCode: 401,
				message: 'Wrong authentication code',
			};
			return status;
		}

		await this.playerService.update(
			user,
			{isTwoFactorAuthenticationEnabled: true, isLoginFactorAuthentication: false}
		)
		const status: ReturnStatus = {
			success: true,
			statusCode: 200,
			person: user,
			message: 'authenticate',
		};
		return status;
	}
}
