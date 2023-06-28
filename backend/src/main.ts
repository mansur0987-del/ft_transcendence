import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = await app.get(ConfigService);
  app.enableCors({
    origin: [config.get<string>('FRONT_URL'), 'https://api.intra.42.fr'],
    credentials: true,
  });

  const port = config.get<number>('API_PORT');
  await app.listen(port || 3000, () => {
    console.log('app started on port: ' + port);
  });
}
bootstrap();
