import type { CardType, CustomProperty, KaitenApi, Tag } from '../kaiten';

/**
 * Company-wide read-only dictionaries (tags, card types, custom property
 * definitions). No `AccessGuard` involved - these aren't scoped to a
 * space/board/card, so the allowlists don't apply.
 */
export class DictionaryService {
  constructor(private readonly api: KaitenApi) {}

  getTags(query?: string, spaceId?: number): Promise<Tag[]> {
    return this.api.company.getTags(query, spaceId);
  }

  getCardTypes(): Promise<CardType[]> {
    return this.api.company.getCardTypes();
  }

  getCustomProperties(): Promise<CustomProperty[]> {
    return this.api.company.getCustomProperties();
  }
}
