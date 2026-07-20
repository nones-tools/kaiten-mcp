import type { CardFile } from '../../kaiten/interfaces/card.js';
import type { SdkContext } from '../context.js';
import * as fileOps from '../files.js';
import type { Constructor } from '../mixin-utils.js';

export function FilesMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    getCardFiles(cardId: number): Promise<CardFile[]> {
      return fileOps.getCardFiles(this, cardId);
    }

    downloadFile(cardId: number, fileId: number): Promise<Buffer> {
      return fileOps.downloadFile(this, cardId, fileId);
    }

    downloadFileToDisk(cardId: number, fileId: number, outputDir: string | null = null) {
      return fileOps.downloadFileToDisk(this, cardId, fileId, outputDir);
    }

    downloadAllCardFiles(cardId: number, outputDir: string | null = null) {
      return fileOps.downloadAllCardFiles(this, cardId, outputDir);
    }

    cleanTempDir(cardId: number | null = null): Promise<number> {
      return fileOps.cleanTempDir(cardId);
    }
  };
}
