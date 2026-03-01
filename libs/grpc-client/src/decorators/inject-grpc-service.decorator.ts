import { Inject } from '@nestjs/common';
import { BaseContract } from '@www/grpc-contracts';

export const InjectGrpcClient = (contract: BaseContract<unknown>) => Inject(contract.serviceToken);
