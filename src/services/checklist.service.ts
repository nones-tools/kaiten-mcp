import type { Checklist, ChecklistItem, KaitenApi } from '../kaiten';
import type { AccessGuard } from './guard';

export class ChecklistService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard
  ) {}

  async getChecklists(cardId: number): Promise<Checklist[]> {
    await this.guard.validateCardId(cardId);
    const card = await this.api.cards.getCard(cardId);
    return card.checklists || [];
  }

  async createChecklist(cardId: number, name: string): Promise<Checklist> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.createChecklist(cardId, name);
  }

  async deleteChecklist(cardId: number, checklistId: number): Promise<unknown> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.deleteChecklist(cardId, checklistId);
  }

  async updateChecklist(cardId: number, checklistId: number, data: Record<string, unknown>): Promise<Checklist> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.updateChecklist(cardId, checklistId, data);
  }

  async toggleChecklistItem(cardId: number, checklistId: number, itemId: number, checked: boolean): Promise<ChecklistItem> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.toggleChecklistItem(checklistId, itemId, checked);
  }

  async addChecklistItem(cardId: number, checklistId: number, text: string): Promise<ChecklistItem> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.addChecklistItem(checklistId, text);
  }

  async deleteChecklistItem(cardId: number, checklistId: number, itemId: number): Promise<unknown> {
    await this.guard.validateCardId(cardId);
    return this.api.cards.deleteChecklistItem(checklistId, itemId);
  }
}
