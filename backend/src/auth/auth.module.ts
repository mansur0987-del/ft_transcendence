import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { PlayerModule } from 'src/player/player.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/accessToken.strategy';
import { HttpModule } from '@nestjs/axios';
import { jwtFirstCheck } from './strategy/jwtFirstCheck.strategy';

@Module({
  imports:[
    PlayerModule,
    PassportModule.register({
      property: 'player',
      session: false,
    }),
    JwtModule.register({}),
    HttpModule
  ],

  providers: [AuthService, JwtStrategy, jwtFirstCheck],
  controllers: [AuthController],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
