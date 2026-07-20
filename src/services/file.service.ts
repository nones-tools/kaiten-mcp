import fs from 'node:fs/promises';
import path from 'node:path';
import type { KaitenApi } from '../kaiten/api/index.js';
import type { CardFile } from '../kaiten/interfaces/card.js';
import { cleanTempDir as cleanTempDirFs, getCardTempDir } from '../lib/temp.js';
import type { AccessGuard } from './guard.js';

export class FileService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard
  ) {}

  async getCardFiles(cardId: number): Promise<CardFile[]> {
    await this.guard.validateCardId(cardId);
    return this.api.files.getCardFiles(cardId);
  }

  async downloadFile(cardId: number, fileId: number): Promise<Buffer> {
    await this.guard.validateCardId(cardId);
    return this.api.files.downloadFile(cardId, fileId);
  }

  async downloadFileToDisk(
    cardId: number,
    fileId: number,
    outputDir: string | null = null
  ): Promise<{ path: string; filename: string; size: number }> {
    await this.guard.validateCardId(cardId);
    const fileData = await this.downloadFile(cardId, fileId);
    const files = await this.getCardFiles(cardId);
    const file = files.find((f) => f.id === fileId);
    const filename = file?.name || `file-${fileId}`;
    const dir = outputDir || getCardTempDir(cardId);

    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, fileData);

    return { path: filePath, filename, size: fileData.length };
  }

  async downloadAllCardFiles(
    cardId: number,
    outputDir: string | null = null
  ): Promise<Array<{ path: string; filename: string; size: number; id: number }>> {
    await this.guard.validateCardId(cardId);
    const files = await this.getCardFiles(cardId);
    const dir = outputDir || getCardTempDir(cardId);

    await fs.mkdir(dir, { recursive: true });

    const results: Array<{ path: string; filename: string; size: number; id: number }> = [];
    for (const file of files) {
      const result = await this.downloadFileToDisk(cardId, file.id, dir);
      results.push({ ...result, id: file.id });
    }
    return results;
  }

  cleanTempDir(cardId: number | null = null): Promise<number> {
    return cleanTempDirFs(cardId);
  }
}
