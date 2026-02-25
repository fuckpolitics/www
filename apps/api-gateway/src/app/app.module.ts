import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GrpcModule } from './grpc/grpc.module';
import { MicroservicesModule } from './microservices/microservices.module';
import { AppService } from './app.service';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [GrpcModule, MicroservicesModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
