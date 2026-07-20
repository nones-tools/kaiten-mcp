import type { KaitenApi } from '../kaiten/api/index.js';
import type { Comment } from '../kaiten/interfaces/comment.js';
import type { AccessGuard } from './guard.js';

export class CommentService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard
  ) {}

  async addComment(cardId: number, text: string, parentId: number | null = null): Promise<Comment> {
    await this.guard.validateCardId(cardId);
    return this.api.comments.createComment(cardId, text, parentId);
  }

  async getComments(cardId: number): Promise<Comment[]> {
    await this.guard.validateCardId(cardId);
    return this.api.comments.getComments(cardId);
  }

  updateComment(commentId: number, text: string): Promise<Comment> {
    return this.api.comments.updateComment(commentId, text);
  }

  deleteComment(commentId: number): Promise<void> {
    return this.api.comments.deleteComment(commentId);
  }
}
