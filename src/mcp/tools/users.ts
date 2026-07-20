import { z } from 'zod';
import type { ToolDef } from '../../interfaces/tool.js';

export const userTools: ToolDef[] = [
  {
    name: 'kaiten_users',
    description: 'Get list of users',
    annotations: { readOnlyHint: true },
    inputSchema: {},
    handler: async (sdk) => sdk.getUsers(),
  },
  {
    name: 'kaiten_search_users',
    description: 'Search users by query',
    annotations: { readOnlyHint: true },
    inputSchema: {
      query: z.string().describe('Search query'),
    },
    handler: async (sdk, args) => sdk.findUser(args.query),
  },
];
