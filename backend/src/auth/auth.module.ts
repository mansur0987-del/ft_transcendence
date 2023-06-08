import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Auth_Service } from './service/auth.service';
import { Auth_Controller } from './controller/auth.controller';
import { PassportModule } from '@nestjs/passport';


@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ ConfigService ],
			useFactory: async (configService: ConfigService) => ({
				signOptions: { expiresIn: "2 days" },
				secret: configService.get<string>('JWT_KEY'),
			})
		}),
		PassportModule,
	],
	providers: [Auth_Service],
	controllers: [Auth_Controller]
})
export class AuthModule {}
