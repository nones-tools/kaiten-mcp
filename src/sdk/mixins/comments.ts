import type { Comment } from '../../kaiten/interfaces/comment.js';
import * as commentOps from '../comments.js';
import type { SdkContext } from '../context.js';
import type { Constructor } from '../mixin-utils.js';

export function CommentsMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    addComment(cardId: number, text: string, parentId: number | null = null): Promise<Comment> {
      return commentOps.addComment(this, cardId, text, parentId);
    }

    getComments(cardId: number): Promise<Comment[]> {
      return commentOps.getComments(this, cardId);
    }

    updateComment(commentId: number, text: string): Promise<Comment> {
      return commentOps.updateComment(this, commentId, text);
    }

    deleteComment(commentId: number): Promise<void> {
      return commentOps.deleteComment(this, commentId);
    }
  };
}
