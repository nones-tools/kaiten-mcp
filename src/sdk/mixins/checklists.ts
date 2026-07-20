import type { Checklist, ChecklistItem } from '../../kaiten/interfaces/card.js';
import * as checklistOps from '../checklists.js';
import type { SdkContext } from '../context.js';
import type { Constructor } from '../mixin-utils.js';

export function ChecklistsMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    getChecklists(cardId: number): Promise<Checklist[]> {
      return checklistOps.getChecklists(this, cardId);
    }

    createChecklist(cardId: number, name: string): Promise<Checklist> {
      return checklistOps.createChecklist(this, cardId, name);
    }

    deleteChecklist(cardId: number, checklistId: number): Promise<unknown> {
      return checklistOps.deleteChecklist(this, cardId, checklistId);
    }

    updateChecklist(cardId: number, checklistId: number, data: Record<string, unknown>): Promise<Checklist> {
      return checklistOps.updateChecklist(this, cardId, checklistId, data);
    }

    toggleChecklistItem(cardId: number, checklistId: number, itemId: number, checked: boolean): Promise<ChecklistItem> {
      return checklistOps.toggleChecklistItem(this, cardId, checklistId, itemId, checked);
    }

    addChecklistItem(cardId: number, checklistId: number, text: string): Promise<ChecklistItem> {
      return checklistOps.addChecklistItem(this, cardId, checklistId, text);
    }

    deleteChecklistItem(cardId: number, checklistId: number, itemId: number): Promise<unknown> {
      return checklistOps.deleteChecklistItem(this, cardId, checklistId, itemId);
    }
  };
}
