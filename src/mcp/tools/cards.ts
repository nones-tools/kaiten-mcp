import { z } from 'zod';
import type { Card } from '../../kaiten/interfaces/card.js';
import type { ToolDef } from '../../interfaces/tool.js';

export const cardTools: ToolDef[] = [
  {
    name: 'kaiten_cards',
    description: 'Get list of cards (optimized format)',
    inputSchema: {
      spaceId: z.number().optional().describe('Space ID (optional, uses default if not specified)'),
      boardId: z.number().optional().describe('Board ID (optional)'),
      minimal: z
        .boolean()
        .optional()
        .describe('Return minimal JSON format (token optimized). Default false (full payload).'),
    },
    handler: async (sdk, args) => sdk.getCards(args.spaceId ?? null, args.boardId ?? null, args.minimal === true),
  },
  {
    name: 'kaiten_card',
    description: 'Get card details',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      simple: z
        .boolean()
        .optional()
        .describe('Return minimal JSON format (token optimized). Default true. Pass false to get the full card payload.'),
    },
    handler: async (sdk, args) => sdk.getCard(args.cardId, args.simple === false ? false : true),
  },
  {
    name: 'kaiten_create_card',
    description:
      'Create a new independent card on a board. Use this for creating separate tasks, not child cards/subtasks. Если известен laneId — указывайте, иначе карточка попадёт на дефолтную lane доски, что для многих досок неверно.',
    inputSchema: {
      title: z.string().describe('Card title - for an independent task on a board'),
      boardId: z.number().describe('Board ID where to create the independent card'),
      columnId: z.number().describe('Column ID where to place the independent card'),
      description: z.string().optional().describe('Card description (optional)'),
      laneId: z
        .number()
        .optional()
        .describe(
          'Lane ID внутри доски. Опционально, но рекомендуется указывать: иначе карточка попадёт на дефолтную lane доски. ID можно взять из ответа kaiten_card у существующей карточки на нужной lane.'
        ),
    },
    handler: async (sdk, args) =>
      sdk.createCard({
        title: args.title,
        boardId: args.boardId,
        columnId: args.columnId,
        description: args.description,
        laneId: args.laneId,
      }),
  },
  {
    name: 'kaiten_update_card',
    description: 'Update a card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      data: z.string().describe('JSON string with card data to update'),
    },
    handler: async (sdk, args) => sdk.updateCard(args.cardId, JSON.parse(args.data)),
  },
  {
    name: 'kaiten_delete_card',
    description: 'Delete a card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
    },
    handler: async (sdk, args) => sdk.deleteCard(args.cardId),
  },
  {
    name: 'kaiten_move_card',
    description:
      'Move a card to different column. Если laneId не указан, карточка останется на текущей lane (или дефолтной для новой колонки).',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      columnId: z.number().describe('Target column ID'),
      laneId: z.number().optional().describe('Lane ID внутри колонки. Опционально.'),
    },
    handler: async (sdk, args) => sdk.moveToColumn(args.cardId, args.columnId, args.laneId ?? null),
  },
  {
    name: 'kaiten_assign_card',
    description: 'Assign user to card',
    inputSchema: {
      cardId: z.number().describe('Card ID'),
      userId: z.number().describe('User ID to assign'),
    },
    handler: async (sdk, args) => sdk.assignTo(args.cardId, args.userId),
  },
  {
    name: 'kaiten_find_cards',
    description: 'Find cards by tag (token optimized - returns only id, title, board_id, column_id, tags)',
    inputSchema: {
      tagName: z.string().describe('Tag name to filter by'),
      boardId: z.number().optional().describe('Board ID (optional)'),
    },
    handler: async (sdk, args) => {
      const findCards = (await sdk.getCards(null, args.boardId ?? null)) as Card[];
      const findFiltered = findCards.filter((c) => c.tags?.some((t) => t.name === args.tagName));
      return findFiltered.map((c) => ({
        id: c.id,
        title: c.title,
        board_id: c.board_id,
        column_id: c.column_id,
        tags: c.tags,
      }));
    },
  },
];
