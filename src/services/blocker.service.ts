import type { CardBlocker, KaitenApi } from '../kaiten';
import type { AccessGuard } from './guard';

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
