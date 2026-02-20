import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GrpcModule } from './grpc/grpc.module';
import { MicroservicesModule } from './microservices/microservices.module';

@Module({
  imports: [GrpcModule, MicroservicesModule],
  controllers: [AppController],
})
export class AppModule {}
