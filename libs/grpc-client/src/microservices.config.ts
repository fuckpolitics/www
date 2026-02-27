import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });

const PROTO_PATHS = {
  user: 'libs/common/src/proto/user.proto',
  auth: 'libs/common/src/proto/auth.proto',
  room: 'libs/common/src/proto/room.proto',
} as const;

export interface MicroserviceConfig {
  name: string;
  url: string;
  package: string;
  protoPath: string;
}

export const MICROSERVICES_CONFIG: Record<string, MicroserviceConfig> = {
  user: {
    name: 'User',
    url: process.env['USER_SERVICE_URL'] || 'localhost:50051',
    package: 'user',
    protoPath: PROTO_PATHS.user,
  },
  auth: {
    name: 'Auth',
    url: process.env['AUTH_SERVICE_URL'] || 'localhost:50052',
    package: 'auth',
    protoPath: PROTO_PATHS.auth,
  },
  room: {
    name: 'Room',
    url: process.env['ROOM_SERVICE_URL'] || 'localhost:50053',
    package: 'room',
    protoPath: PROTO_PATHS.room,
  },
};

export function normalizeServiceName(serviceName: string): string {
  const key = serviceName.toLowerCase();
  if (MICROSERVICES_CONFIG[key]) {
    return key;
  }
  return serviceName;
}
