import type { ExternalLink, KaitenApi } from '../kaiten';
import type { AccessGuard } from './guard';

export class LinkService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard
  ) {}

  async getExternalLinks(cardId: number): Promise<ExternalLink[]> {
    await this.guard.validateCardId(cardId);
    return this.api.links.getExternalLinks(cardId);
  }

  async addExternalLink(cardId: number, url: string, description?: string): Promise<ExternalLink> {
    await this.guard.validateCardId(cardId);
    return this.api.links.addExternalLink(cardId, url, description);
  }

  async removeExternalLink(cardId: number, linkId: number): Promise<unknown> {
    await this.guard.validateCardId(cardId);
    return this.api.links.removeExternalLink(cardId, linkId);
  }
}
