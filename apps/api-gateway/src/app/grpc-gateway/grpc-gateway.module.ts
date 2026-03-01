import { Module } from '@nestjs/common';
import { GrpcClientModule } from '@www/grpc-client';
import { GRPC_CONTRACTS } from '@www/grpc-contracts';
import { GrpcGatewayService } from './grpc-gateway.service';

@Module({
  imports: [GrpcClientModule.register({ contracts: Object.values(GRPC_CONTRACTS) })],
  providers: [GrpcGatewayService],
  exports: [GrpcGatewayService],
})
export class GrpcGatewayModule {}
