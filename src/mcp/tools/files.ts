import { z } from 'zod';
import type { ToolDef } from '../../interfaces/tool.js';

export const fileTools: ToolDef[] = [
  {
    name: 'kaiten_get_files',
    description: 'Get list of files attached to a card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
    },
    handler: async (sdk, args) => sdk.getCardFiles(args.cardId),
  },
  {
    name: 'kaiten_download_file',
    description: 'Download a single file from a card to temp directory',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      fileId: z.number().describe('File ID to download'),
      outputDir: z.string().optional().describe('Output directory (optional, defaults to /tmp/kaiten/{cardId}/)'),
    },
    handler: async (sdk, args) => sdk.downloadFileToDisk(args.cardId, args.fileId, args.outputDir ?? null),
  },
  {
    name: 'kaiten_download_all_files',
    description: 'Download all files from a card to temp directory',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      outputDir: z.string().optional().describe('Output directory (optional, defaults to /tmp/kaiten/{cardId}/)'),
    },
    handler: async (sdk, args) => sdk.downloadAllCardFiles(args.cardId, args.outputDir ?? null),
  },
  {
    name: 'kaiten_clean_temp',
    description: 'Clean temporary directory for Kaiten files',
    inputSchema: {
      dir: z
        .string()
        .optional()
        .describe('Directory to clean (optional, /tmp/kaiten/{cardId}/ if cardId in dir path, otherwise /tmp/kaiten/)'),
    },
    handler: async (sdk, args) => {
      let cardId: number | null = null;
      const match = args.dir && typeof args.dir === 'string' ? args.dir.match(/\/kaiten\/(\d+)/) : null;
      if (match) {
        cardId = parseInt(match[1], 10);
      }
      return { deleted: await sdk.cleanTempDir(cardId) };
    },
  },
];
