import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class Auth_Service {
	constructor(
		private readonly jwtService: JwtService
	){}
}
