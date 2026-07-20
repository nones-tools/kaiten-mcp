import type { Comment } from '../kaiten/interfaces/comment.js';
import type { SdkContext } from './context.js';
import { validateCardId } from './guard.js';

export async function addComment(ctx: SdkContext, cardId: number, text: string, parentId: number | null = null): Promise<Comment> {
  await validateCardId(ctx, cardId);
  return ctx.api.comments.createComment(cardId, text, parentId);
}

export async function getComments(ctx: SdkContext, cardId: number): Promise<Comment[]> {
  await validateCardId(ctx, cardId);
  return ctx.api.comments.getComments(cardId);
}

export function updateComment(ctx: SdkContext, commentId: number, text: string): Promise<Comment> {
  return ctx.api.comments.updateComment(commentId, text);
}

export function deleteComment(ctx: SdkContext, commentId: number): Promise<void> {
  return ctx.api.comments.deleteComment(commentId);
}
