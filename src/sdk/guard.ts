import type { SdkContext } from './context.js';

export function validateSpaceId(ctx: SdkContext, spaceId: number | null | undefined): true {
  if (!ctx.config.allowedSpaceIds || !spaceId) return true;
  if (!ctx.config.allowedSpaceIds.includes(spaceId)) {
    throw new Error(`Space ID ${spaceId} is not in allowed list`);
  }
  return true;
}

export function validateBoardId(ctx: SdkContext, boardId: number | null | undefined): true {
  if (!ctx.config.allowedBoardIds || !boardId) return true;
  if (!ctx.config.allowedBoardIds.includes(boardId)) {
    throw new Error(`Board ID ${boardId} is not in allowed list`);
  }
  return true;
}

/**
 * Swallows lookup errors (e.g. card not found) so validation never masks
 * an unrelated failure - only re-throws when the card is confirmed to
 * belong to a disallowed board.
 */
export async function validateCardId(ctx: SdkContext, cardId: number | null | undefined): Promise<true> {
  if (!ctx.config.allowedBoardIds || !cardId) return true;
  try {
    const card = await ctx.api.cards.getCard(cardId);
    if (card?.board_id && !ctx.config.allowedBoardIds.includes(card.board_id)) {
      throw new Error(`Card ${cardId} belongs to board ${card.board_id} which is not in allowed list`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('not in allowed list')) {
      throw error;
    }
  }
  return true;
}
