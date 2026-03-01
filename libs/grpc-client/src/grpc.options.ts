import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BaseContract } from '@www/grpc-contracts';

interface GrpcOptionsParams {
  contract: BaseContract<unknown>;
  config: ConfigService;
}

export const getGrpcOptions = ({ contract, config }: GrpcOptionsParams): GrpcOptions => ({
  transport: Transport.GRPC,
  options: {
    package: contract.package,
    protoPath: contract.protoPath,
    url: config.getOrThrow<string>(contract.urlConfigKey),
    loader: {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      arrays: true,
    },
  },
});
