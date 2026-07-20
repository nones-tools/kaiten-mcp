import type { Card } from '../../kaiten/interfaces/card.js';
import type { SdkContext } from '../context.js';
import type { Constructor } from '../mixin-utils.js';
import type { TaggedCard } from '../projections.js';
import * as tagOps from '../tags.js';

export function TagsMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    addTag(cardId: number, tagName: string): Promise<TaggedCard> {
      return tagOps.addTag(this, cardId, tagName);
    }

    removeTag(cardId: number, tagName: string): Promise<TaggedCard> {
      return tagOps.removeTag(this, cardId, tagName);
    }

    setTags(cardId: number, tagNames: string[]): Promise<Card> {
      return tagOps.setTags(this, cardId, tagNames);
    }

    hasTag(card: Card, tagName: string): boolean {
      return tagOps.hasTag(card, tagName);
    }

    getTags(card: Card): string[] {
      return tagOps.getTags(card);
    }

    getCardsWithTag(tagName: string, spaceId: number | null = null): Promise<Card[]> {
      return tagOps.getCardsWithTag(this, tagName, spaceId);
    }

    getCardsWithoutTag(tagName: string, spaceId: number | null = null): Promise<Card[]> {
      return tagOps.getCardsWithoutTag(this, tagName, spaceId);
    }
  };
}
