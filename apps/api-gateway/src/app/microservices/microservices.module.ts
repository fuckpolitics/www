import { Module } from '@nestjs/common';
import { MicroservicesService } from './microservices.service';
import { GrpcModule } from '../grpc/grpc.module';

@Module({
  imports: [GrpcModule],
  providers: [MicroservicesService],
  exports: [MicroservicesService],
})
export class MicroservicesModule {}
