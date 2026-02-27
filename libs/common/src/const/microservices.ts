export type MethodDescriptor = {
  service: string;
  method: string;
  requiresAuth?: boolean;
  isInternal?: boolean;
};

export const MICROSERVICES = {
  user: {
    service: 'user',
    getUser: { service: 'user', method: 'getUser', requiresAuth: true },
    getUserByEmail: { service: 'user', method: 'getUserByEmail', isInternal: true },
    createUser: { service: 'user', method: 'createUser' },
    updateUser: { service: 'user', method: 'updateUser', requiresAuth: true },
    deleteUser: { service: 'user', method: 'deleteUser', requiresAuth: true },
  },
  auth: {
    service: 'auth',
    register: { service: 'auth', method: 'register' },
    login: { service: 'auth', method: 'login' },
    validateToken: { service: 'auth', method: 'validateToken', isInternal: true },
    refreshToken: { service: 'auth', method: 'refreshToken' },
  },
  room: {
    service: 'room',
    join: { service: 'room', method: 'join', requiresAuth: true },
    leave: { service: 'room', method: 'leave', requiresAuth: true },
    getRoomInfo: { service: 'room', method: 'getRoomInfo', requiresAuth: true },
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
