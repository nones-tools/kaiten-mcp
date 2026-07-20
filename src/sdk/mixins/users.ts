import type { User } from '../../kaiten/interfaces/user.js';
import type { SdkContext } from '../context.js';
import type { Constructor } from '../mixin-utils.js';
import * as userOps from '../users.js';

export function UsersMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    findUser(query: string): Promise<User> {
      return userOps.findUser(this, query);
    }

    getCurrentUser(): Promise<User> {
      return userOps.getCurrentUser(this);
    }

    getUsers(): Promise<User[]> {
      return userOps.getUsers(this);
    }
  };
}
