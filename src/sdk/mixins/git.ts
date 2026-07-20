import type { SdkContext } from '../context.js';
import * as gitOps from '../git.js';
import type { Constructor } from '../mixin-utils.js';

export function GitMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    getCurrentBranch(): Promise<string> {
      return gitOps.getCurrentBranch();
    }

    createGitBranch(cardId: number, title?: string): Promise<string> {
      return gitOps.createGitBranch(this, cardId, title);
    }

    checkoutGitBranch(cardId: number, title?: string): Promise<string> {
      return gitOps.checkoutGitBranch(this, cardId, title);
    }

    commitGit(cardId: number, message: string): Promise<void> {
      return gitOps.commitGit(cardId, message);
    }

    getGitChanges(): Promise<string> {
      return gitOps.getGitChanges();
    }

    getGitStatus(): Promise<string> {
      return gitOps.getGitStatus();
    }

    gitAddAll(): Promise<void> {
      return gitOps.gitAddAll();
    }

    gitPush(cardId: number, title?: string): Promise<void> {
      return gitOps.gitPush(this, cardId, title);
    }

    createPullRequest(cardId: number, title: string): Promise<void> {
      return gitOps.createPullRequest(cardId, title);
    }
  };
}
