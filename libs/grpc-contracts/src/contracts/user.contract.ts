import { createContract } from '../utils/contract.factory';
import { USER_PACKAGE_NAME, USER_SERVICE_NAME, UserClient } from '../generated/user';

export const UserContract = createContract<UserClient>('user', {
  package: USER_PACKAGE_NAME,
  serviceName: USER_SERVICE_NAME,
  methods: {
    getUser: { requiresAuth: true },
    getUserByEmail: { isInternal: true },
    createUser: {},
    updateUser: { requiresAuth: true },
    deleteUser: { requiresAuth: true },
  },
});
