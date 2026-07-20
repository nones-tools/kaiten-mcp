import { inject, injectable } from 'inversify';
import type { KaitenApiPort, KaitenConfig } from '../kaiten';
import { TOKENS } from '../di/tokens';

/**
 * Enforces the KAITEN_ALLOWED_SPACE_IDS / KAITEN_ALLOWED_BOARD_IDS
 * allowlists. Semantics moved verbatim from the pre-refactor KaitenSDK
 * private methods.
 */
@injectable()
export class AccessGuard {
  constructor(
    @inject(TOKENS.KaitenApi) private readonly api: KaitenApiPort,
    @inject(TOKENS.Config) private readonly config: Pick<KaitenConfig, 'allowedSpaceIds' | 'allowedBoardIds'>
  ) {}

  validateSpaceId(spaceId: number | null | undefined): true {
    if (!this.config.allowedSpaceIds || !spaceId) return true;
    if (!this.config.allowedSpaceIds.includes(spaceId)) {
      throw new Error(`Space ID ${spaceId} is not in allowed list`);
    }
    return true;
  }

  validateBoardId(boardId: number | null | undefined): true {
    if (!this.config.allowedBoardIds || !boardId) return true;
    if (!this.config.allowedBoardIds.includes(boardId)) {
      throw new Error(`Board ID ${boardId} is not in allowed list`);
    }
    return true;
  }

  /**
   * Swallows lookup errors (e.g. card not found) so validation never masks
   * an unrelated failure - only re-throws when the card is confirmed to
   * belong to a disallowed board.
   */
  async validateCardId(cardId: number | null | undefined): Promise<true> {
    if (!this.config.allowedBoardIds || !cardId) return true;
    try {
      const card = await this.api.cards.getCard(cardId);
      if (card?.board_id && !this.config.allowedBoardIds.includes(card.board_id)) {
        throw new Error(`Card ${cardId} belongs to board ${card.board_id} which is not in allowed list`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not in allowed list')) {
        throw error;
      }
    }
    return true;
  }
}
