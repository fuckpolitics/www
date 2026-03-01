import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { GrpcGatewayModule } from './grpc-gateway/grpc-gateway.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GrpcGatewayModule],
  providers: [EventsGateway],
})
export class AppModule {}
