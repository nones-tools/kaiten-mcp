import * as gitApi from '../lib/git.js';
import type { SdkContext } from './context.js';

export async function getCurrentBranch(): Promise<string> {
  return gitApi.getCurrentBranch();
}

export async function createGitBranch(ctx: SdkContext, cardId: number, title?: string): Promise<string> {
  const isRepo = await gitApi.isGitRepo();
  if (!isRepo) {
    throw new Error('Not a git repository');
  }
  const cardTitle = title || (await ctx.api.cards.getCard(cardId)).title;
  return gitApi.createBranch(cardId, cardTitle);
}

export async function checkoutGitBranch(ctx: SdkContext, cardId: number, title?: string): Promise<string> {
  const isRepo = await gitApi.isGitRepo();
  if (!isRepo) {
    throw new Error('Not a git repository');
  }
  const cardTitle = title || (await ctx.api.cards.getCard(cardId)).title;
  return gitApi.checkoutBranch(cardId, cardTitle);
}

export async function commitGit(cardId: number, message: string): Promise<void> {
  return gitApi.commitChanges(cardId, message);
}

export async function getGitChanges(): Promise<string> {
  return gitApi.getCurrentChanges();
}

export async function getGitStatus(): Promise<string> {
  return gitApi.getCurrentChanges();
}

export async function gitAddAll(): Promise<void> {
  return gitApi.addAllFiles();
}

export async function gitPush(ctx: SdkContext, cardId: number, title?: string): Promise<void> {
  const isRepo = await gitApi.isGitRepo();
  if (!isRepo) {
    throw new Error('Not a git repository');
  }
  const branchName = await createGitBranch(ctx, cardId, title);
  return gitApi.pushBranch(branchName);
}

export async function createPullRequest(cardId: number, title: string): Promise<void> {
  return gitApi.createPR(cardId, title);
}
