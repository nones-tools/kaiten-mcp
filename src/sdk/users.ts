import type { User } from '../kaiten/interfaces/user.js';
import type { SdkContext } from './context.js';

export async function findUser(ctx: SdkContext, query: string): Promise<User> {
  const users = await ctx.api.users.searchUsers(query);
  if (users.length === 0) {
    throw new Error(`User "${query}" not found`);
  }
  return users[0]!;
}

export function getCurrentUser(ctx: SdkContext): Promise<User> {
  return ctx.api.users.getCurrentUser();
}

export function getUsers(ctx: SdkContext): Promise<User[]> {
  return ctx.api.users.getUsers();
}
