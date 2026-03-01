import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AsyncOptions, GrpcOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { getGrpcOptions } from '@www/grpc-client';
import { RoomContract } from '@www/grpc-contracts';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncOptions<GrpcOptions>>(AppModule, {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => getGrpcOptions({ contract: RoomContract, config }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen();
  Logger.log(`🚀 Room Service is running on: ${process.env.ROOM_SERVICE_URL || '0.0.0.0:50053'}`);
}

bootstrap();
