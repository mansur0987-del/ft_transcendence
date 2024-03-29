import { BadRequestException, Injectable } from "@nestjs/common";
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
import { lastValueFrom } from 'rxjs';
import { PlayerStatus } from "src/player/enums/playerStatus.enum";
import { Response } from "express";
import QrCode from "src/player/entities/qrcode.entity";


@Injectable()
export class AuthService {
	constructor(
		private readonly playerService: PlayerService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {}

	async getAccessToken(name42: string): Promise<string>{
		const accessToken = this.jwtService.signAsync({
			name42: name42
		},
        {
          secret: this.configService.get<string>('JWT_ACCESS_KEY'),
          expiresIn: this.configService.get<string>('EXPIRESIN_ACCESS_KEY'),
        })
		return accessToken;
	}

	async CreatePlayer(createPlayerDto: CreatePlayerDto): Promise<PlayerEntity> {
		const playerInDb = await this.playerService.GetPlayerByName42(createPlayerDto.name42);
		if (playerInDb)
			return playerInDb

		const newPlayer = await this.playerService.create(createPlayerDto);
		return newPlayer;
	}

	async login(){
		const api_42 = 'https://api.intra.42.fr/oauth/authorize';
		const client_id = 'client_id=' + process.env.UID_42;
		const redirect_uri = 'redirect_uri=' + process.env.REDIRECT_URI;
		const response_type = 'response_type=code';
		const scope = 'scope=public'
		const redirect = api_42 + '?' + client_id + '&' + scope +  '&' + redirect_uri + '&' + response_type
		return redirect
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

		const getPlayerToken = await this.httpService.post(url_42, body);
		const lastValuePlayerToken = await lastValueFrom(getPlayerToken)

		const header = {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + lastValuePlayerToken.data.access_token,
		}
		const GetPlayerInfo = await this.httpService.get('https://api.intra.42.fr/v2/me', {headers: header})
		const lastValuePlayerInfo = await lastValueFrom(GetPlayerInfo)

		const playerInDB = await this.CreatePlayer({name42: lastValuePlayerInfo.data.login});
		const accessToken = await this.getAccessToken(playerInDB.name42);

		await this.playerService.update(playerInDB, {isLogin : true, status: PlayerStatus.ONLINE})
		const update_player = await this.playerService.GetPlayerById(playerInDB.id)

		const status: ReturnStatus = {
				success: true,
				statusCode: 200,
				message: 'player: ' + update_player.name + ' login',
				person: update_player,
				data: {accessToken},
		};
		return status
	}

	async signIn(player: PlayerEntity, data: LoginPlayerDto) {
		const playerInDb = await this.playerService.GetPlayerById(player.id);
		if (playerInDb.isTwoFactorAuthenticationEnabled){
			if (!data.twoFactorAuthenticationCode){
				throw new BadRequestException('code 2fa is null');
			}

			const isCodeValid = authenticator.verify({
				token: data.twoFactorAuthenticationCode,
				secret: playerInDb.twoFactorAuthenticationSecret,
			});
			if (!isCodeValid) {
				throw new BadRequestException('Wrong authentication code 2fa');
			}
			await this.playerService.update(playerInDb, {isLoginFactorAuthentication : true})
		}

		await this.playerService.update(playerInDb, {isLogin : true, status: PlayerStatus.ONLINE})
		const update_player = await this.playerService.GetPlayerById(playerInDb.id)

		const status: ReturnStatus = {
			success: true,
			statusCode: 200,
			message: 'player: ' + update_player.name + ' login',
			person: update_player
		};
		return status
	}

	async logout(player : PlayerEntity) : Promise<ReturnStatus> {
		await this.playerService.update(player, {
			isLogin : false,
			isLoginFactorAuthentication : false,
			status: PlayerStatus.OFFLINE
		})
		const update_player = await this.playerService.GetPlayerById(player.id)

		const status: ReturnStatus = {
			success: true,
			statusCode: 200,
			person: update_player,
			message: 'player: ' + update_player.name + ' logout',
		};
		return status;
	}

	async turn_off (player: PlayerEntity, twoFactorAuthenticationCode: string) : Promise<ReturnStatus> {
		if (twoFactorAuthenticationCode == null){
			throw new BadRequestException('twoFactorAuthenticationCode is null');
		}

		const isCodeValid = authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: player.twoFactorAuthenticationSecret,
		});
		if (!isCodeValid) {
			throw new BadRequestException('Wrong authentication code');
		}

		const new_player = await this.playerService.update(player, {
			isTwoFactorAuthenticationEnabled: false,
			isLoginFactorAuthentication: false,
			})

		const status: ReturnStatus = {
			success: true,
			statusCode: 200,
			person: new_player,
			message: 'new_player: ' + player.name + ' turn off 2fa',
		};
		return status;
	}

	async register(player: PlayerEntity) : Promise<QrCode> {
		const qrCode = await this.playerService.getQrCode(player.id)
		if (qrCode){
			return qrCode
		}
		const { secret, otpAuthUrl } = await this.generateTwoFactorAuthenticationSecret(player);
		await this.playerService.update(
			player,
			{twoFactorAuthenticationSecret: secret}
		)
		const newQrCodeData = await toDataURL(otpAuthUrl)
		const newQrCode = await this.playerService.addQrCode(player.id, newQrCodeData, "file")

		return newQrCode
	}

	async generateTwoFactorAuthenticationSecret(player: PlayerEntity) {
		const secret = authenticator.generateSecret();

		const otpAuthUrl = authenticator.keyuri(
			player.name,
			'ft_transcendance',
			secret,
		);

		return {
			secret,
			otpAuthUrl,
		};
	  }

	async authenticate(player: PlayerEntity, twoFactorAuthenticationCode: string) : Promise<ReturnStatus> {

		if (twoFactorAuthenticationCode == null){
			throw new BadRequestException('twoFactorAuthenticationCode is null');
		}
		const isCodeValid = authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: player.twoFactorAuthenticationSecret,
		});
		if (!isCodeValid) {
			throw new BadRequestException('Wrong authentication code');
		}

		await this.playerService.update(
			player,
			{isTwoFactorAuthenticationEnabled: true, isLoginFactorAuthentication: false}
		)
		const update_player = await this.playerService.GetPlayerById(player.id)

		const status: ReturnStatus = {
			success: true,
			statusCode: 200,
			person: update_player,
			message: 'authenticate',
		};
		return status;
	}
}
