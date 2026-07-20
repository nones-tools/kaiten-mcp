import type { Card } from '../../kaiten/interfaces/card.js';
import * as cardOps from '../cards.js';
import type { CreateCardInput } from '../cards.js';
import type { SdkContext } from '../context.js';
import type { Constructor } from '../mixin-utils.js';
import type { MinimalCard } from '../projections.js';

export function CardsMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    getCards(spaceId: number | null = null, boardId: number | null = null, minimal = false): Promise<Card[] | MinimalCard[]> {
      return cardOps.getCards(this, spaceId, boardId, minimal);
    }

    getCard(cardId: number, minimal = false): Promise<Card | MinimalCard> {
      return cardOps.getCard(this, cardId, minimal);
    }

    createCard(input: CreateCardInput): Promise<Card> {
      return cardOps.createCard(this, input);
    }

    updateCard(cardId: number, data: Record<string, unknown>): Promise<Card> {
      return cardOps.updateCard(this, cardId, data);
    }

    deleteCard(cardId: number): Promise<unknown> {
      return cardOps.deleteCard(this, cardId);
    }

    moveToColumn(cardId: number, columnId: number, laneId: number | null = null) {
      return cardOps.moveToColumn(this, cardId, columnId, laneId);
    }

    assignTo(cardId: number, userId: number) {
      return cardOps.assignTo(this, cardId, userId);
    }

    unassignFrom(cardId: number, userId: number): Promise<Card> {
      return cardOps.unassignFrom(this, cardId, userId);
    }

    archive(cardId: number): Promise<Card> {
      return cardOps.archive(this, cardId);
    }

    unarchive(cardId: number): Promise<Card> {
      return cardOps.unarchive(this, cardId);
    }
  };
}
