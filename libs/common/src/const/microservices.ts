export type MethodDescriptor = {
  service: string;
  method: string;
  requiresAuth?: boolean;
  isInternal?: boolean;
};

export const MICROSERVICES = {
  user: {
    service: 'User',
    getUser: { service: 'User', method: 'getUser', requiresAuth: true },
    getUserByEmail: { service: 'User', method: 'getUserByEmail', isInternal: true },
    createUser: { service: 'User', method: 'createUser' },
    updateUser: { service: 'User', method: 'updateUser', requiresAuth: true },
    deleteUser: { service: 'User', method: 'deleteUser', requiresAuth: true },
  },
  auth: {
    service: 'Auth',
    register: { service: 'Auth', method: 'register' },
    login: { service: 'Auth', method: 'login' },
    validateToken: { service: 'Auth', method: 'validateToken', isInternal: true },
    refreshToken: { service: 'Auth', method: 'refreshToken' },
  },
  room: {
    service: 'Room',
    join: { service: 'Room', method: 'join', requiresAuth: true },
    leave: { service: 'Room', method: 'leave', requiresAuth: true },
    getRoomInfo: { service: 'Room', method: 'getRoomInfo', requiresAuth: true },
  },
} as const;

const METHOD_ACCESS_MAP: Record<string, Record<string, { requiresAuth?: boolean; isInternal?: boolean }>> = {};
for (const [, svc] of Object.entries(MICROSERVICES)) {
  if (typeof svc === 'object' && svc !== null && 'service' in svc) {
    const name = (svc as { service: string }).service;
    if (!METHOD_ACCESS_MAP[name]) METHOD_ACCESS_MAP[name] = {};
    for (const [key, val] of Object.entries(svc)) {
      if (key !== 'service' && val && typeof val === 'object' && 'method' in val) {
        const v = val as MethodDescriptor;
        METHOD_ACCESS_MAP[name][v.method] = {
          requiresAuth: v.requiresAuth,
          isInternal: v.isInternal,
        };
      }
    }
  }
}

export function getMethodAccess(
  serviceName: string,
  methodName: string,
): { requiresAuth?: boolean; isInternal?: boolean } | null {
  return METHOD_ACCESS_MAP[serviceName]?.[methodName] ?? null;
}
