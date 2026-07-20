import type { Card } from '../kaiten/interfaces/card.js';
import type { SdkContext } from './context.js';
import { validateBoardId, validateCardId, validateSpaceId } from './guard.js';
import { type MinimalCard, toMinimalCard } from './projections.js';

export interface CreateCardInput {
  title: string;
  description?: string;
  boardId: number;
  columnId: number;
  laneId?: number | null;
  tags?: (string | { name: string })[];
  size?: number;
  plannedStart?: string;
  plannedEnd?: string;
  parentId?: number | null;
}

export async function getCards(
  ctx: SdkContext,
  spaceId: number | null = null,
  boardId: number | null = null,
  minimal = false
): Promise<Card[] | MinimalCard[]> {
  const id = spaceId || ctx.config.defaultSpaceId;
  validateSpaceId(ctx, id);
  const cards = boardId ? await ctx.api.cards.getCards(id as number, boardId) : await ctx.api.cards.getCards(id as number);
  if (!minimal) return cards;
  return cards.map(toMinimalCard);
}

export async function getCard(ctx: SdkContext, cardId: number, minimal = false): Promise<Card | MinimalCard> {
  await validateCardId(ctx, cardId);
  const card = await ctx.api.cards.getCard(cardId);
  if (minimal) return toMinimalCard(card);
  return card;
}

export async function createCard(ctx: SdkContext, input: CreateCardInput): Promise<Card> {
  const { title, description, boardId, columnId, laneId, tags, size, plannedStart, plannedEnd, parentId = null } = input;
  validateBoardId(ctx, boardId);
  const data: Record<string, unknown> = {
    title,
    board_id: boardId,
    column_id: columnId,
  };

  if (description) data.description = description;
  if (laneId) data.lane_id = laneId;
  if (tags) data.tags = tags.map((t) => (typeof t === 'string' ? { name: t } : t));
  if (size) data.size = size;
  if (plannedStart) data.planned_start = plannedStart;
  if (plannedEnd) data.planned_end = plannedEnd;
  if (parentId) data.parent_id = parentId;

  return ctx.api.cards.createCard(data);
}

export async function updateCard(ctx: SdkContext, cardId: number, data: Record<string, unknown>): Promise<Card> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.updateCard(cardId, data);
}

export async function deleteCard(ctx: SdkContext, cardId: number): Promise<unknown> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.deleteCard(cardId);
}

export async function moveToColumn(
  ctx: SdkContext,
  cardId: number,
  columnId: number,
  laneId: number | null = null
): Promise<{ success: true; cardId: number; columnId: number; laneId: number | null }> {
  await validateCardId(ctx, cardId);
  await ctx.api.cards.moveCard(cardId, columnId, laneId);
  return { success: true, cardId, columnId, laneId };
}

export async function assignTo(ctx: SdkContext, cardId: number, userId: number): Promise<{ success: true; cardId: number; userId: number }> {
  await validateCardId(ctx, cardId);
  await ctx.api.cards.assignCard(cardId, userId);
  return { success: true, cardId, userId };
}

export async function unassignFrom(ctx: SdkContext, cardId: number, userId: number): Promise<Card> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.unassignCard(cardId, userId);
}

export async function archive(ctx: SdkContext, cardId: number): Promise<Card> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.archiveCard(cardId);
}

export async function unarchive(ctx: SdkContext, cardId: number): Promise<Card> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.unarchiveCard(cardId);
}
