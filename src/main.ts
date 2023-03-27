import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser())
  app.enableCors({
    origin: [
      'http://localhost:4200', // admin app
      'http://localhost:4300', // ambassador app
      'http://localhost:5000' // checkout
    ],
    credentials: true // this way the cookie we generate in BE will be stored on FE 
  })
  await app.listen(3000);
}
bootstrap();
