import type { KaitenApi } from '../kaiten/api/index.js';
import type { Card } from '../kaiten/interfaces/card.js';
import type { CardService } from './card.service.js';
import type { AccessGuard } from './guard.js';
import { type TaggedCard, toTaggedCard } from './projections.js';

export class TagService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard,
    private readonly cards: CardService
  ) {}

  async addTag(cardId: number, tagName: string): Promise<TaggedCard> {
    await this.guard.validateCardId(cardId);
    await this.api.cards.addTag(cardId, tagName);
    const card = await this.api.cards.getCard(cardId);
    return toTaggedCard(card);
  }

  async removeTag(cardId: number, tagName: string): Promise<TaggedCard> {
    await this.guard.validateCardId(cardId);
    await this.api.cards.removeTag(cardId, tagName);
    const card = await this.api.cards.getCard(cardId);
    return toTaggedCard(card);
  }

  async setTags(cardId: number, tagNames: string[]): Promise<Card> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.setTags(cardId, tagNames);
  }

  hasTag(card: Card, tagName: string): boolean {
    return card.tags?.some((t) => t.name === tagName) ?? false;
  }

  getTags(card: Card): string[] {
    return card.tags?.map((t) => t.name) ?? [];
  }

  async getCardsWithTag(tagName: string, spaceId: number | null = null): Promise<Card[]> {
    const cards = (await this.cards.getCards(spaceId)) as Card[];
    return cards.filter((card) => this.hasTag(card, tagName));
  }

  async getCardsWithoutTag(tagName: string, spaceId: number | null = null): Promise<Card[]> {
    const cards = (await this.cards.getCards(spaceId)) as Card[];
    return cards.filter((card) => !this.hasTag(card, tagName));
  }
}
