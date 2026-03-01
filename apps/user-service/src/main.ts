import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AsyncOptions, GrpcOptions } from '@nestjs/microservices';
import { getGrpcOptions } from '@www/grpc-client';
import { ConfigService } from '@nestjs/config';
import { UserContract } from '@www/grpc-contracts';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncOptions<GrpcOptions>>(AppModule, {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => getGrpcOptions({ contract: UserContract, config }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen();
  Logger.log('🚀 User Service is running...');
}

bootstrap();
