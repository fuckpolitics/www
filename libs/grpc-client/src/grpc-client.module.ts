import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, ClientsModuleAsyncOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BaseContract } from '@www/grpc-contracts';
import { getGrpcOptions } from './grpc.options';

export interface GrpcClientModuleOptions {
  contracts: BaseContract<unknown>[];
  isGlobal?: boolean;
}

@Module({})
export class GrpcClientModule {
  static register(options: GrpcClientModuleOptions): DynamicModule {
    const { contracts, isGlobal = false } = options;

    const grpcClientsOptions: ClientsModuleAsyncOptions = contracts.map((contract) => ({
      name: contract.clientToken,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getGrpcOptions({ contract, config }),
    }));

    const grpcServices: FactoryProvider[] = contracts.map((contract) => ({
      provide: contract.serviceToken,
      inject: [contract.clientToken],
      useFactory: (client: ClientGrpc) => client.getService(contract.serviceName),
    }));

    return {
      module: GrpcClientModule,
      global: isGlobal,
      imports: [ClientsModule.registerAsync(grpcClientsOptions)],
      providers: [...grpcServices],
      exports: [...grpcServices.map((p) => p.provide)],
    };
  }
}
