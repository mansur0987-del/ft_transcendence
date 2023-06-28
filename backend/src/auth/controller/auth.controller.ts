import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, Res, Redirect, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginPlayerDto } from 'src/player/dto/loginPlayer.dto';
import { AuthGuard } from '@nestjs/passport';
import { ReturnStatus } from '../interfaces/return.interface';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		) {}

	@Get('login')
	public async login(){
		return await this.authService.login();
	}

	@Get('callback')
	public async callback(@Request() req, @Res() res: Response){
		const result = await this.authService.callback(req.query.code)
		const data : any = result.data

		const url = process.env.FRONT_URL + '/login' + '?code=' + data.accessToken
		res.status(302).redirect(url)
	}

	@UseGuards(AuthGuard('jwtFirstCheck'))
	@Post('signin')
	public async signin(@Request() req, @Body() data: LoginPlayerDto) {
		return await this.authService.signIn(req.player, data);
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('logout')
	public async logout(@Request() req) : Promise<ReturnStatus> {
		return await this.authService.logout(req.player);
	}

	@Post('2fa/turn-off')
	@UseGuards(AuthGuard('jwt'))
	async turn_off(@Request() req, @Body() body): Promise<ReturnStatus>{
		return await this.authService.turn_off(req.player, body.twoFactorAuthenticationCode)
	}

	@Post('2fa/generate')
	@UseGuards(AuthGuard('jwt'))
	async register(@Request() req, @Res() res: Response): Promise<ReturnStatus> {
		return await this.authService.register(req.player, res)
	}

	@Post('2fa/authenticate')
	@HttpCode(200)
	@UseGuards(AuthGuard('jwt'))
	async authenticate(@Request() req, @Body() body): Promise<ReturnStatus> {
		return await this.authService.authenticate(req.player, body.twoFactorAuthenticationCode)
	}
}
