import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { Payload } from '../entities/payload.entity';
import { Users_entity } from 'src/users/users.entity';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(
  Strategy,
  'jwt-2fa',
  ) {
    constructor(private readonly userService: UsersService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_2FA_KEY + '',
      });
    }

    async validate(payload: Payload): Promise<Users_entity> {
      const user = await this.userService.GetUserByName(payload.username);

      if (user.isTwoFactorAuthenticationEnabled === true) {
        return user;
      }
    }
  }
