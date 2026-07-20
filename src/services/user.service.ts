import type { KaitenApi } from '../kaiten/api/index.js';
import type { User } from '../kaiten/interfaces/user.js';

export class UserService {
  constructor(private readonly api: KaitenApi) {}

  async findUser(query: string): Promise<User> {
    const users = await this.api.users.searchUsers(query);
    if (users.length === 0) {
      throw new Error(`User "${query}" not found`);
    }
    return users[0]!;
  }

  getCurrentUser(): Promise<User> {
    return this.api.users.getCurrentUser();
  }

  getUsers(): Promise<User[]> {
    return this.api.users.getUsers();
  }
}
