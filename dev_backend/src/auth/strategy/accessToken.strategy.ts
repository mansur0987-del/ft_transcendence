import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { Users_entity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { Payload } from '../entities/payload.entity';


@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  "jwt"
  ) {
    constructor(
      private readonly userService: UsersService
      ) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_ACCESS_KEY + '',
    });
  }

  async validate(payload: Payload): Promise<Users_entity> {
    const user = this.userService.GetUserByName(payload.username);

    if (user){
      return user;
    }
  }
}
