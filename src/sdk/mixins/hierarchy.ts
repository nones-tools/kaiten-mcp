import type { Card } from '../../kaiten/interfaces/card.js';
import type { SdkContext } from '../context.js';
import * as hierarchyOps from '../hierarchy.js';
import type { TaskFlowTask } from '../hierarchy.js';
import type { Constructor } from '../mixin-utils.js';
import type { MinimalParent, MinimalSubtask } from '../projections.js';

export function HierarchyMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    createSubtask(parentId: number, title: string, position = 0): Promise<Card> {
      return hierarchyOps.createSubtask(this, parentId, title, position);
    }

    getSubtasks(cardId: number, minimal = false): Promise<Card[] | MinimalSubtask[]> {
      return hierarchyOps.getSubtasks(this, cardId, minimal);
    }

    getAllSubtasks(cardId: number, minimal = false): Promise<Card[] | MinimalSubtask[]> {
      return hierarchyOps.getAllSubtasks(this, cardId, minimal);
    }

    getParent(cardId: number, minimal = false): Promise<Card | MinimalParent | null> {
      return hierarchyOps.getParent(this, cardId, minimal);
    }

    attachToParent(cardId: number, parentId: number, position = 0): Promise<unknown> {
      return hierarchyOps.attachToParent(this, cardId, parentId, position);
    }

    detachFromParent(cardId: number): Promise<unknown> {
      return hierarchyOps.detachFromParent(this, cardId);
    }

    createTaskFlow(parentCard: number, tasks: TaskFlowTask[]): Promise<Record<string, unknown>[]> {
      return hierarchyOps.createTaskFlow(this, parentCard, tasks);
    }
  };
}
