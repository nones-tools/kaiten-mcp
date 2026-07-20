import { z } from 'zod';
import type { ToolDef } from '../../interfaces/tool.js';

export const navigationTools: ToolDef[] = [
  {
    name: 'kaiten_spaces',
    description: 'Get list of available Kaiten spaces',
    inputSchema: {},
    handler: async (sdk) => sdk.getSpaces(),
  },
  {
    name: 'kaiten_boards',
    description: 'Get list of boards in a space',
    inputSchema: {
      spaceId: z.number().optional().describe('Space ID (optional, uses default if not specified)'),
    },
    handler: async (sdk, args) => sdk.getBoards(args.spaceId),
  },
  {
    name: 'kaiten_columns',
    description: 'Get list of columns in a board',
    inputSchema: {
      boardId: z.number().describe('Board ID'),
    },
    handler: async (sdk, args) => sdk.getColumns(args.boardId),
  },
];
