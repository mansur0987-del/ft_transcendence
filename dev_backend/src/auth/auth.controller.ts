import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/creat_user.dto';
import { UsernamePasswordDTO } from 'src/users/dto/login_user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	public async signup(@Body() createUserDto: CreateUserDto) {
		return await this.authService.signUp(createUserDto);
	}

	@Post('signin')
	public async signin(@Body() data: UsernamePasswordDTO) {
		return await this.authService.signIn(data.username, data.password);
	}

	@UseGuards(AuthGuard('jwt-2fa'))
	@Get('logout')
	public async logout(@Request() req) {
		return await this.authService.logout(req.user);
	}

	@Post('2fa/generate')
	@UseGuards(AuthGuard('jwt'))
	async register(@Response() res, @Request() req) {
		const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(
			req.user
		);

		return res.json(
			await this.authService.generateQrCodeDataURL(otpAuthUrl),
		);
	}

	@Post('2fa/authenticate')
	@HttpCode(200)
	@UseGuards(AuthGuard('jwt'))
	async authenticate(@Request() req, @Body() body) {
		const result = await this.authService.authenticate(req.user, body.twoFactorAuthenticationCode)
		return result
	}
}
