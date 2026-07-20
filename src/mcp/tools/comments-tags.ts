import { z } from 'zod';
import type { ToolDef } from '../../interfaces/tool.js';

export const commentTools: ToolDef[] = [
  {
    name: 'kaiten_add_comment',
    description: 'Add comment to card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      text: z.string().describe('Comment text'),
    },
    handler: async (sdk, args) => sdk.addComment(args.cardId, args.text),
  },
  {
    name: 'kaiten_get_comments',
    description: 'Get comments for card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
    },
    handler: async (sdk, args) => sdk.getComments(args.cardId),
  },
];

export const tagTools: ToolDef[] = [
  {
    name: 'kaiten_add_tag',
    description: 'Add tag to card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      tagName: z.string().describe('Tag name'),
    },
    handler: async (sdk, args) => sdk.addTag(args.cardId, args.tagName),
  },
  {
    name: 'kaiten_remove_tag',
    description: 'Remove tag from card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      tagName: z.string().describe('Tag name'),
    },
    handler: async (sdk, args) => sdk.removeTag(args.cardId, args.tagName),
  },
];
