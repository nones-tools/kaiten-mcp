import type { Card } from '../kaiten/interfaces/card.js';
import { getCards } from './cards.js';
import type { SdkContext } from './context.js';
import { validateCardId } from './guard.js';
import { type TaggedCard, toTaggedCard } from './projections.js';

export async function addTag(ctx: SdkContext, cardId: number, tagName: string): Promise<TaggedCard> {
  await validateCardId(ctx, cardId);
  await ctx.api.cards.addTag(cardId, tagName);
  const card = await ctx.api.cards.getCard(cardId);
  return toTaggedCard(card);
}

export async function removeTag(ctx: SdkContext, cardId: number, tagName: string): Promise<TaggedCard> {
  await validateCardId(ctx, cardId);
  await ctx.api.cards.removeTag(cardId, tagName);
  const card = await ctx.api.cards.getCard(cardId);
  return toTaggedCard(card);
}

export async function setTags(ctx: SdkContext, cardId: number, tagNames: string[]): Promise<Card> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.setTags(cardId, tagNames);
}

export function hasTag(card: Card, tagName: string): boolean {
  return card.tags?.some((t) => t.name === tagName) ?? false;
}

export function getTags(card: Card): string[] {
  return card.tags?.map((t) => t.name) ?? [];
}

export async function getCardsWithTag(ctx: SdkContext, tagName: string, spaceId: number | null = null): Promise<Card[]> {
  const cards = (await getCards(ctx, spaceId)) as Card[];
  return cards.filter((card) => hasTag(card, tagName));
}

export async function getCardsWithoutTag(ctx: SdkContext, tagName: string, spaceId: number | null = null): Promise<Card[]> {
  const cards = (await getCards(ctx, spaceId)) as Card[];
  return cards.filter((card) => !hasTag(card, tagName));
}
