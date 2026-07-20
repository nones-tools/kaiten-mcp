import fs from 'node:fs/promises';
import path from 'node:path';
import type { CardFile } from '../kaiten/interfaces/card.js';
import { cleanTempDir as cleanTempDirFs, getCardTempDir } from '../lib/temp.js';
import type { SdkContext } from './context.js';
import { validateCardId } from './guard.js';

export async function getCardFiles(ctx: SdkContext, cardId: number): Promise<CardFile[]> {
  await validateCardId(ctx, cardId);
  return ctx.api.files.getCardFiles(cardId);
}

export async function downloadFile(ctx: SdkContext, cardId: number, fileId: number): Promise<Buffer> {
  await validateCardId(ctx, cardId);
  return ctx.api.files.downloadFile(cardId, fileId);
}

export async function downloadFileToDisk(
  ctx: SdkContext,
  cardId: number,
  fileId: number,
  outputDir: string | null = null
): Promise<{ path: string; filename: string; size: number }> {
  await validateCardId(ctx, cardId);
  const fileData = await downloadFile(ctx, cardId, fileId);
  const files = await getCardFiles(ctx, cardId);
  const file = files.find((f) => f.id === fileId);
  const filename = file?.name || `file-${fileId}`;
  const dir = outputDir || getCardTempDir(cardId);

  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, fileData);

  return { path: filePath, filename, size: fileData.length };
}

export async function downloadAllCardFiles(
  ctx: SdkContext,
  cardId: number,
  outputDir: string | null = null
): Promise<Array<{ path: string; filename: string; size: number; id: number }>> {
  await validateCardId(ctx, cardId);
  const files = await getCardFiles(ctx, cardId);
  const dir = outputDir || getCardTempDir(cardId);

  await fs.mkdir(dir, { recursive: true });

  const results: Array<{ path: string; filename: string; size: number; id: number }> = [];
  for (const file of files) {
    const result = await downloadFileToDisk(ctx, cardId, file.id, dir);
    results.push({ ...result, id: file.id });
  }
  return results;
}

export async function cleanTempDir(cardId: number | null = null): Promise<number> {
  return cleanTempDirFs(cardId);
}
