import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/accessToken.strategy';
import { Jwt2faStrategy } from './strategy/jwt-2fa.strategy';

@Module({
  imports:[
    UsersModule,
    PassportModule.register({
      property: 'user',
      session: false,
    }),
    JwtModule.register({})
  ],

  providers: [AuthService, JwtStrategy, Jwt2faStrategy],
  controllers: [AuthController],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
