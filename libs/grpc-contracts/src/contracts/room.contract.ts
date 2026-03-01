import { createContract } from '../utils/contract.factory';
import { ROOM_PACKAGE_NAME, ROOM_SERVICE_NAME, RoomClient } from '../generated/room';

export const RoomContract = createContract<RoomClient>('room', {
  package: ROOM_PACKAGE_NAME,
  serviceName: ROOM_SERVICE_NAME,
  methods: {
    join: { requiresAuth: true },
    leave: { requiresAuth: true },
    getRoomInfo: { requiresAuth: true },
  },
});
