import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { type_chat_modul } from './type_chat/type_chat.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, envFilePath: '../.env'}),
    //GraphQLModule.forRoot<ApolloDriverConfig>({
    //  driver: ApolloDriver,
    //  autoSchemaFile: 'schema.gql',
    //  sortSchema: true,
    //  playground: true,
    //}),

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
    type_chat_modul,
    PlayerModule,
    ],
  providers: [],
  controllers: [],
})
export class AppModule {}
