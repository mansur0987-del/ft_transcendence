import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from './player/player.module';
import { AuthModule } from './auth/auth.module';
//import { GamesModule } from './games/games.module';
//import { Games1Module } from './games_1/games_1.module';
//import { PongModule } from './pong/pong.module';
//import { Pong1Module } from './pong1/pong1.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: config.get<'aurora-data-api'>('TYPEORM_CONNECTION') as 'postgres',
        host: config.get<string>('TYPEORM_HOST'),
        username: config.get<string>('TYPEORM_USERNAME'),
        password: config.get<string>('TYPEORM_PASSWORD'),
        database: config.get<string>('TYPEORM_DATABASE'),
        port: config.get<number>('TYPEORM_PORT'),
        entities: [__dirname + 'dist/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
        logging: true,
      }),
    }),
    PlayerModule,
    AuthModule,
    //GamesModule,
    //Games1Module,
    //PongModule,
    //Pong1Module,
    GameModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
