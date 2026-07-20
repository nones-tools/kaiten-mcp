import type { KaitenApi } from '../kaiten/api/index.js';
import type { Card } from '../kaiten/interfaces/card.js';
import type { KaitenConfig } from '../kaiten/interfaces/config.js';
import type { AccessGuard } from './guard.js';
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
  typeId?: number;
}

export class CardService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard,
    private readonly config: Pick<KaitenConfig, 'defaultSpaceId'>
  ) {}

  async getCards(spaceId: number | null = null, boardId: number | null = null, minimal = false): Promise<Card[] | MinimalCard[]> {
    const id = spaceId || this.config.defaultSpaceId;
    this.guard.validateSpaceId(id);
    const cards = boardId ? await this.api.cards.getCards(id as number, boardId) : await this.api.cards.getCards(id as number);
    if (!minimal) return cards;
    return cards.map(toMinimalCard);
  }

  async getCard(cardId: number, minimal = false): Promise<Card | MinimalCard> {
    await this.guard.validateCardId(cardId);
    const card = await this.api.cards.getCard(cardId);
    if (minimal) return toMinimalCard(card);
    return card;
  }

  async createCard(input: CreateCardInput): Promise<Card> {
    const { title, description, boardId, columnId, laneId, tags, size, plannedStart, plannedEnd, parentId = null, typeId } = input;
    this.guard.validateBoardId(boardId);
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
    if (typeId) data.type_id = typeId;

    return this.api.cards.createCard(data);
  }

  async updateCard(cardId: number, data: Record<string, unknown>): Promise<Card> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.updateCard(cardId, data);
  }

  async deleteCard(cardId: number): Promise<unknown> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.deleteCard(cardId);
  }

  async moveToColumn(
    cardId: number,
    columnId: number,
    laneId: number | null = null
  ): Promise<{ success: true; cardId: number; columnId: number; laneId: number | null }> {
    await this.guard.validateCardId(cardId);
    await this.api.cards.moveCard(cardId, columnId, laneId);
    return { success: true, cardId, columnId, laneId };
  }

  async assignTo(cardId: number, userId: number): Promise<{ success: true; cardId: number; userId: number }> {
    await this.guard.validateCardId(cardId);
    await this.api.cards.assignCard(cardId, userId);
    return { success: true, cardId, userId };
  }

  async unassignFrom(cardId: number, userId: number): Promise<Card> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.unassignCard(cardId, userId);
  }

  async archive(cardId: number): Promise<Card> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.archiveCard(cardId);
  }

  async unarchive(cardId: number): Promise<Card> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.unarchiveCard(cardId);
  }
}
