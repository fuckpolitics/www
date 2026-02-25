import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { join, resolve } from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from 'dotenv';
import { PROTO_FILES } from '@www/common';

config({ path: resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(__dirname, 'proto', PROTO_FILES.AUTH),
        url: process.env.AUTH_SERVICE_URL || '0.0.0.0:50052',
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          arrays: true,
        },
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen();
  Logger.log(
    `🚀 Auth Service is running on: ${process.env.AUTH_SERVICE_URL || '0.0.0.0:50052'}`,
  );
}

bootstrap();
