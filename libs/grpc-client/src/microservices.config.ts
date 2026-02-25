import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });

const PROTO_PATHS = {
  user: 'libs/common/src/proto/user.proto',
  auth: 'libs/common/src/proto/auth.proto',
} as const;

export interface MicroserviceConfig {
  name: string;
  url: string;
  package: string;
  protoPath: string;
}

export const MICROSERVICES_CONFIG: Record<string, MicroserviceConfig> = {
  user: {
    name: 'user',
    url: process.env['USER_SERVICE_URL'] || 'localhost:50051',
    package: 'user',
    protoPath: PROTO_PATHS.user,
  },
  auth: {
    name: 'auth',
    url: process.env['AUTH_SERVICE_URL'] || 'localhost:50052',
    package: 'auth',
    protoPath: PROTO_PATHS.auth,
  },
};

export function normalizeServiceName(serviceName: string): string {
  const key = serviceName.toLowerCase();
  if (MICROSERVICES_CONFIG[key]) {
    return key;
  }
  return serviceName;
}
