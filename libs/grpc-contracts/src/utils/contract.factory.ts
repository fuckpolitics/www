import { BaseContract } from './interfaces';
import { join } from 'node:path';

const PROTO_ROOT = 'libs/grpc-contracts/src/proto';

export const createContract = <TClient>(
  name: string,
  data: Omit<BaseContract<TClient>, 'clientToken' | 'urlConfigKey' | 'protoPath' | 'serviceToken'>,
): BaseContract<TClient> => ({
  ...data,
  clientToken: `GRPC_${name.toUpperCase()}_CLIENT`,
  serviceToken: `GRPC_${name.toUpperCase()}_SERVICE`,
  urlConfigKey: `${name.toUpperCase()}_SERVICE_URL`,
  protoPath: join(process.cwd(), PROTO_ROOT, `${name.toLowerCase()}.proto`),
});
