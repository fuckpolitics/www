import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BaseContract, GRPC_CONTRACTS, GrpcClientInstance } from '@www/grpc-contracts';
import { AuthClient } from '@www/grpc-contracts/generated/auth';
import { ModuleRef } from '@nestjs/core';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectGrpcClient } from '@www/grpc-client';

@Injectable()
export class GrpcGatewayService implements OnModuleInit {
  private readonly logger = new Logger(GrpcGatewayService.name);

  private readonly services = new Map<string, GrpcClientInstance>();
  private readonly contracts = new Map<string, BaseContract<unknown>>();

  constructor(
    @InjectGrpcClient(GRPC_CONTRACTS.AuthContract) public readonly authClient: AuthClient,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    for (const contract of Object.values(GRPC_CONTRACTS)) {
      const client = this.moduleRef.get<GrpcClientInstance>(contract.serviceToken, { strict: false });
      this.contracts.set(contract.serviceName, contract);
      this.services.set(contract.serviceName, client);
    }
  }

  getService(serviceName: string) {
    return this.services.get(serviceName);
  }

  getContract(serviceName: string) {
    return this.contracts.get(serviceName);
  }
}
