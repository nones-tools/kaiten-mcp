import type { HttpTransport } from '../interfaces/http.js';
import type { CardFile } from '../interfaces/card.js';

export class FilesApi {
  constructor(private readonly client: HttpTransport) {}

  getCardFiles(cardId: number): Promise<CardFile[]> {
    return this.client.get<CardFile[]>(`/cards/${cardId}/files`);
  }

  downloadFile(cardId: number, fileId: number): Promise<Buffer> {
    return this.client.getBuffer(`/cards/${cardId}/files/${fileId}`);
  }
}
