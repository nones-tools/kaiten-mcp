import type { Card } from '../kaiten/interfaces/card.js';
import { updateCard } from './cards.js';
import type { SdkContext } from './context.js';
import { validateCardId } from './guard.js';
import { type MinimalParent, type MinimalSubtask, toMinimalParent, toMinimalSubtask } from './projections.js';

export interface TaskFlowTask {
  title: string;
  description?: string;
  tags?: (string | { name: string })[];
  [key: string]: unknown;
}

export async function createSubtask(ctx: SdkContext, parentId: number, title: string, position = 0): Promise<Card> {
  await validateCardId(ctx, parentId);
  return ctx.api.subtasks.createSubtask(parentId, title, position);
}

export async function getSubtasks(ctx: SdkContext, cardId: number, minimal = false): Promise<Card[] | MinimalSubtask[]> {
  await validateCardId(ctx, cardId);
  const subtasks = await ctx.api.subtasks.getSubtasks(cardId);
  if (minimal) return subtasks.map(toMinimalSubtask);
  return subtasks;
}

export async function getAllSubtasks(ctx: SdkContext, cardId: number, minimal = false): Promise<Card[] | MinimalSubtask[]> {
  await validateCardId(ctx, cardId);
  const subtasks = await ctx.api.subtasks.getAllSubtasks(cardId);
  if (minimal) return subtasks.map(toMinimalSubtask);
  return subtasks;
}

export async function getParent(ctx: SdkContext, cardId: number, minimal = false): Promise<Card | MinimalParent | null> {
  await validateCardId(ctx, cardId);
  const parent = await ctx.api.subtasks.getParent(cardId);
  if (minimal && parent) return toMinimalParent(parent);
  return parent;
}

export async function attachToParent(ctx: SdkContext, cardId: number, parentId: number, position = 0): Promise<unknown> {
  await validateCardId(ctx, cardId);
  await validateCardId(ctx, parentId);
  return ctx.api.subtasks.attachToParent(cardId, parentId, position);
}

export async function detachFromParent(ctx: SdkContext, cardId: number): Promise<unknown> {
  await validateCardId(ctx, cardId);
  return ctx.api.subtasks.detachFromParent(cardId);
}

export async function createTaskFlow(ctx: SdkContext, parentCard: number, tasks: TaskFlowTask[]): Promise<Record<string, unknown>[]> {
  const createdTasks: Record<string, unknown>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]!;
    const subtask = await createSubtask(ctx, parentCard, task.title, i);

    if (task.description) {
      await updateCard(ctx, subtask.id, { description: task.description });
    }

    if (task.tags) {
      await updateCard(ctx, subtask.id, {
        tags: task.tags.map((t) => (typeof t === 'string' ? { name: t } : t)),
      });
    }

    createdTasks.push({ ...subtask, ...task });
  }

  return createdTasks;
}
