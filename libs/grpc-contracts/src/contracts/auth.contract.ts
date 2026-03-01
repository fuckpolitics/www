import { createContract } from '../utils/contract.factory';
import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME, AuthClient } from '../generated/auth';

export const AuthContract = createContract<AuthClient>('auth', {
  package: AUTH_PACKAGE_NAME,
  serviceName: AUTH_SERVICE_NAME,
  methods: {
    register: {},
    login: { isInternal: true },
    validateToken: { isInternal: true },
    refreshToken: { isInternal: true },
  },
});
