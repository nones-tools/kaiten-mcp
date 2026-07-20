import type { Checklist, ChecklistItem } from '../kaiten/interfaces/card.js';
import type { SdkContext } from './context.js';
import { validateCardId } from './guard.js';

export async function getChecklists(ctx: SdkContext, cardId: number): Promise<Checklist[]> {
  await validateCardId(ctx, cardId);
  const card = await ctx.api.cards.getCard(cardId);
  return card.checklists || [];
}

export async function createChecklist(ctx: SdkContext, cardId: number, name: string): Promise<Checklist> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.createChecklist(cardId, name);
}

export async function deleteChecklist(ctx: SdkContext, cardId: number, checklistId: number): Promise<unknown> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.deleteChecklist(cardId, checklistId);
}

export async function updateChecklist(
  ctx: SdkContext,
  cardId: number,
  checklistId: number,
  data: Record<string, unknown>
): Promise<Checklist> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.updateChecklist(cardId, checklistId, data);
}

export async function toggleChecklistItem(
  ctx: SdkContext,
  cardId: number,
  checklistId: number,
  itemId: number,
  checked: boolean
): Promise<ChecklistItem> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.toggleChecklistItem(checklistId, itemId, checked);
}

export async function addChecklistItem(ctx: SdkContext, cardId: number, checklistId: number, text: string): Promise<ChecklistItem> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.addChecklistItem(checklistId, text);
}

export async function deleteChecklistItem(ctx: SdkContext, cardId: number, checklistId: number, itemId: number): Promise<unknown> {
  await validateCardId(ctx, cardId);
  return ctx.api.cards.deleteChecklistItem(checklistId, itemId);
}
