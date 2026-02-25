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
        package: 'user',
        protoPath: join(__dirname, 'proto', PROTO_FILES.USER),
        url: process.env.USER_SERVICE_URL || '0.0.0.0:50051',
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
    `🚀 User Service is running on: ${process.env.USER_SERVICE_URL || '0.0.0.0:50051'}`,
  );
}

bootstrap();
