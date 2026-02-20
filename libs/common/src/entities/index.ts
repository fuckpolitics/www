export { User } from './user.entity';
export { AuthCredential } from './auth-credential.entity';
export { RefreshToken } from './refresh-token.entity';

import { User } from './user.entity';
import { AuthCredential } from './auth-credential.entity';
import { RefreshToken } from './refresh-token.entity';

export const entities = [User, AuthCredential, RefreshToken];
