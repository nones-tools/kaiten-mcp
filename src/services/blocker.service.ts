import type { KaitenApi } from '../kaiten/api/index.js';
import type { CardBlocker } from '../kaiten/interfaces/blocker.js';
import type { AccessGuard } from './guard.js';

export class BlockerService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard
  ) {}

  async getBlockers(cardId: number): Promise<CardBlocker[]> {
    await this.guard.validateCardId(cardId);
    return this.api.blockers.getBlockers(cardId);
  }

  async blockCard(cardId: number, reason?: string, blockerCardId?: number): Promise<CardBlocker> {
    await this.guard.validateCardId(cardId);
    return this.api.blockers.blockCard(cardId, reason, blockerCardId);
  }

  async unblockCard(cardId: number, blockerId: number): Promise<unknown> {
    await this.guard.validateCardId(cardId);
    return this.api.blockers.unblockCard(cardId, blockerId);
  }
}
