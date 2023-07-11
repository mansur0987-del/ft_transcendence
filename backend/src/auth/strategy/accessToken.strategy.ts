import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PlayerEntity } from 'src/player/entities/player.entity';
import { PlayerService } from 'src/player/service/player.service';
import { Payload } from '../entities/payload.entity';


@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  "jwt"
  ) {
    constructor(
      private readonly playerService: PlayerService
      ) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_ACCESS_KEY + '',
    });
  }

  async validate(payload: Payload): Promise<PlayerEntity> {
    const player = await this.playerService.GetPlayerByName42(payload.name42);

    if (player?.isLogin){
      if (player.isTwoFactorAuthenticationEnabled == false){
        return player;
      }

      else if (player.isLoginFactorAuthentication){
        return player;
      }

      else if (payload.twoFactorAuthenticatedCode) {
        return player;
      }
    }
  }
}
