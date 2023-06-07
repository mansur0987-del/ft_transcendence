import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlayerModule } from './player/player.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, envFilePath: '../.env'}),
    TypeOrmModule.forRootAsync({
			imports: [ ConfigModule ],
			inject: [ ConfigService ],
			useFactory: async (config: ConfigService) => ({
				type: config.get<'aurora-data-api'>('TYPEORM_CONNECTION') as 'postgres',
				host: config.get<string>('TYPEORM_HOST'),
				username: config.get<string>('TYPEORM_USERNAME'),
				password: config.get<string>('TYPEORM_PASSWORD'),
				database: config.get<string>('TYPEORM_DATABASE'),
				port: config.get<number>('TYPEORM_PORT'),
				entities: [ __dirname + 'dist/**/*.entity{.ts,.js}' ],
				synchronize: true,
				autoLoadEntities: true,
				logging: true,
			}),
    }),
    PlayerModule,
    AuthModule,
    ],
  providers: [],
  controllers: [],
})
export class AppModule {}
