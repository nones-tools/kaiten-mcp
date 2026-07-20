import { describe, expect, mock, test } from 'bun:test';
import type { KaitenSDK } from '../src/sdk.js';
import { tools } from '../src/mcp/tools/index.js';

/**
 * Expected tool list + required-param sets, transcribed directly from the
 * old hand-rolled server's `registerTools()` in mcp-server.js (root of the
 * repo). The old server actually registers 39 tools (not 38 as the rewrite
 * spec assumed) - this list matches that file exactly, which is the
 * authoritative behavioral reference per the spec ("must match the old
 * mcp-server.js exactly").
 */
const OLD_TOOLS: { name: string; required: string[] }[] = [
  { name: 'kaiten_spaces', required: [] },
  { name: 'kaiten_boards', required: [] },
  { name: 'kaiten_columns', required: ['boardId'] },
  { name: 'kaiten_cards', required: [] },
  { name: 'kaiten_card', required: ['cardId'] },
  { name: 'kaiten_create_card', required: ['title', 'boardId', 'columnId'] },
  { name: 'kaiten_update_card', required: ['cardId', 'data'] },
  { name: 'kaiten_delete_card', required: ['cardId'] },
  { name: 'kaiten_move_card', required: ['cardId', 'columnId'] },
  { name: 'kaiten_assign_card', required: ['cardId', 'userId'] },
  { name: 'kaiten_find_cards', required: ['tagName'] },
  { name: 'kaiten_add_comment', required: ['cardId', 'text'] },
  { name: 'kaiten_get_comments', required: ['cardId'] },
  { name: 'kaiten_create_child_card', required: ['parentId', 'title'] },
  { name: 'kaiten_get_child_cards', required: ['cardId'] },
  { name: 'kaiten_get_all_child_cards', required: ['cardId'] },
  { name: 'kaiten_get_parent', required: ['cardId'] },
  { name: 'kaiten_attach_to_parent', required: ['cardId', 'parentId'] },
  { name: 'kaiten_detach_from_parent', required: ['cardId'] },
  { name: 'kaiten_add_tag', required: ['cardId', 'tagName'] },
  { name: 'kaiten_remove_tag', required: ['cardId', 'tagName'] },
  { name: 'kaiten_git_branch', required: ['cardId'] },
  { name: 'kaiten_git_checkout', required: ['cardId'] },
  { name: 'kaiten_git_commit', required: ['cardId'] },
  { name: 'kaiten_git_status', required: [] },
  { name: 'kaiten_git_push', required: ['cardId'] },
  { name: 'kaiten_users', required: [] },
  { name: 'kaiten_search_users', required: ['query'] },
  { name: 'kaiten_get_checklists', required: ['cardId'] },
  { name: 'kaiten_create_checklist', required: ['cardId', 'name'] },
  { name: 'kaiten_delete_checklist', required: ['cardId', 'checklistId'] },
  { name: 'kaiten_update_checklist', required: ['cardId', 'checklistId', 'name'] },
  { name: 'kaiten_toggle_checklist_item', required: ['cardId', 'checklistId', 'itemId', 'checked'] },
  { name: 'kaiten_add_checklist_item', required: ['cardId', 'checklistId', 'text'] },
  { name: 'kaiten_delete_checklist_item', required: ['cardId', 'checklistId', 'itemId'] },
  { name: 'kaiten_get_files', required: ['cardId'] },
  { name: 'kaiten_download_file', required: ['cardId', 'fileId'] },
  { name: 'kaiten_download_all_files', required: ['cardId'] },
  { name: 'kaiten_clean_temp', required: [] },
];

function toolByName(name: string) {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`tool ${name} not found in registry`);
  return tool;
}

/** A required zod field is anything that isn't `.optional()` (i.e. not undefined-accepting). */
function requiredParams(inputSchema: Record<string, { isOptional?: () => boolean }>): string[] {
  return Object.entries(inputSchema)
    .filter(([, schema]) => !schema.isOptional?.())
    .map(([key]) => key);
}

function makeStubSdk(overrides: Record<string, (...args: any[]) => any> = {}): KaitenSDK {
  const base: Record<string, (...args: any[]) => any> = {
    getSpaces: mock(async () => ['space']),
    getBoards: mock(async () => ['board']),
    getColumns: mock(async () => ['column']),
    getCards: mock(async () => []),
    getCard: mock(async () => ({ id: 1, title: 'card' })),
    createCard: mock(async () => ({ id: 1 })),
    updateCard: mock(async () => ({ id: 1 })),
    deleteCard: mock(async () => ({ ok: true })),
    moveToColumn: mock(async () => ({ success: true })),
    assignTo: mock(async () => ({ success: true })),
    addComment: mock(async () => ({ id: 1 })),
    getComments: mock(async () => []),
    createSubtask: mock(async () => ({ id: 2 })),
    getSubtasks: mock(async () => []),
    getAllSubtasks: mock(async () => []),
    getParent: mock(async () => null),
    attachToParent: mock(async () => ({ ok: true })),
    detachFromParent: mock(async () => ({ ok: true })),
    addTag: mock(async () => ({ id: 1 })),
    removeTag: mock(async () => ({ id: 1 })),
    createGitBranch: mock(async () => 'feature/1-branch'),
    checkoutGitBranch: mock(async () => 'feature/1-branch'),
    commitGit: mock(async () => undefined),
    getGitStatus: mock(async () => 'clean'),
    gitPush: mock(async () => undefined),
    getUsers: mock(async () => []),
    findUser: mock(async () => ({ id: 1 })),
    getChecklists: mock(async () => []),
    createChecklist: mock(async () => ({ id: 1 })),
    deleteChecklist: mock(async () => ({ ok: true })),
    updateChecklist: mock(async () => ({ id: 1 })),
    toggleChecklistItem: mock(async () => ({ id: 1 })),
    addChecklistItem: mock(async () => ({ id: 1 })),
    deleteChecklistItem: mock(async () => ({ ok: true })),
    getCardFiles: mock(async () => []),
    downloadFileToDisk: mock(async () => ({ path: '/tmp/x' })),
    downloadAllCardFiles: mock(async () => []),
    cleanTempDir: mock(async () => 0),
  };
  return { ...base, ...overrides } as unknown as KaitenSDK;
}

describe('mcp tool registry', () => {
  test('has exactly 39 tools (matches old mcp-server.js registerTools() exactly)', () => {
    expect(tools).toHaveLength(39);
  });

  test('tool names match the old server list exactly, in order', () => {
    expect(tools.map((t) => t.name)).toEqual(OLD_TOOLS.map((t) => t.name));
  });

  test('no duplicate tool names', () => {
    const names = tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  for (const expected of OLD_TOOLS) {
    test(`${expected.name}: required params match old JSON schema`, () => {
      const tool = toolByName(expected.name);
      const actualRequired = requiredParams(tool.inputSchema as any).sort();
      expect(actualRequired).toEqual([...expected.required].sort());
    });
  }
});

describe('mcp tool handlers - delegation to SDK', () => {
  test('kaiten_card defaults simple=true when omitted', async () => {
    const getCard = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ getCard });
    await toolByName('kaiten_card').handler(sdk, { cardId: 1 });
    expect(getCard).toHaveBeenCalledWith(1, true);
  });

  test('kaiten_card passes simple=false when explicitly set', async () => {
    const getCard = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ getCard });
    await toolByName('kaiten_card').handler(sdk, { cardId: 1, simple: false });
    expect(getCard).toHaveBeenCalledWith(1, false);
  });

  test('kaiten_card treats simple=true explicitly the same as default', async () => {
    const getCard = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ getCard });
    await toolByName('kaiten_card').handler(sdk, { cardId: 1, simple: true });
    expect(getCard).toHaveBeenCalledWith(1, true);
  });

  test('kaiten_cards minimal flag defaults to false', async () => {
    const getCards = mock(async () => []);
    const sdk = makeStubSdk({ getCards });
    await toolByName('kaiten_cards').handler(sdk, {});
    expect(getCards).toHaveBeenCalledWith(null, null, false);
  });

  test('kaiten_cards minimal=true is passed through', async () => {
    const getCards = mock(async () => []);
    const sdk = makeStubSdk({ getCards });
    await toolByName('kaiten_cards').handler(sdk, { spaceId: 5, boardId: 9, minimal: true });
    expect(getCards).toHaveBeenCalledWith(5, 9, true);
  });

  test('kaiten_cards minimal only becomes true for boolean true (not truthy values)', async () => {
    const getCards = mock(async () => []);
    const sdk = makeStubSdk({ getCards });
    await toolByName('kaiten_cards').handler(sdk, { minimal: 'yes' as unknown as boolean });
    expect(getCards).toHaveBeenCalledWith(null, null, false);
  });

  test('kaiten_update_card JSON.parses the data string param', async () => {
    const updateCard = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ updateCard });
    await toolByName('kaiten_update_card').handler(sdk, { cardId: 7, data: '{"title":"new title","size":3}' });
    expect(updateCard).toHaveBeenCalledWith(7, { title: 'new title', size: 3 });
  });

  test('kaiten_update_card propagates JSON.parse errors for malformed data', async () => {
    const sdk = makeStubSdk();
    await expect(toolByName('kaiten_update_card').handler(sdk, { cardId: 7, data: 'not json' })).rejects.toThrow();
  });

  test('kaiten_create_card passes laneId through to sdk.createCard', async () => {
    const createCard = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ createCard });
    await toolByName('kaiten_create_card').handler(sdk, {
      title: 'T',
      boardId: 1,
      columnId: 2,
      description: 'D',
      laneId: 42,
    });
    expect(createCard).toHaveBeenCalledWith({ title: 'T', boardId: 1, columnId: 2, description: 'D', laneId: 42 });
  });

  test('kaiten_create_card works without laneId (undefined passthrough)', async () => {
    const createCard = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ createCard });
    await toolByName('kaiten_create_card').handler(sdk, { title: 'T', boardId: 1, columnId: 2 });
    expect(createCard).toHaveBeenCalledWith({
      title: 'T',
      boardId: 1,
      columnId: 2,
      description: undefined,
      laneId: undefined,
    });
  });

  test('kaiten_move_card passes laneId through to sdk.moveToColumn', async () => {
    const moveToColumn = mock(async () => ({ success: true }));
    const sdk = makeStubSdk({ moveToColumn });
    await toolByName('kaiten_move_card').handler(sdk, { cardId: 1, columnId: 3, laneId: 9 });
    expect(moveToColumn).toHaveBeenCalledWith(1, 3, 9);
  });

  test('kaiten_move_card defaults laneId to null when omitted', async () => {
    const moveToColumn = mock(async () => ({ success: true }));
    const sdk = makeStubSdk({ moveToColumn });
    await toolByName('kaiten_move_card').handler(sdk, { cardId: 1, columnId: 3 });
    expect(moveToColumn).toHaveBeenCalledWith(1, 3, null);
  });

  test('kaiten_find_cards filters by tag name and projects 5 fields', async () => {
    const cards = [
      { id: 1, title: 'A', board_id: 10, column_id: 20, tags: [{ id: 1, name: 'bug' }], description: 'x' },
      { id: 2, title: 'B', board_id: 10, column_id: 21, tags: [{ id: 2, name: 'feature' }], description: 'y' },
      { id: 3, title: 'C', board_id: 10, column_id: 22, tags: [], description: 'z' },
    ];
    const getCards = mock(async () => cards);
    const sdk = makeStubSdk({ getCards });
    const result = await toolByName('kaiten_find_cards').handler(sdk, { tagName: 'bug' });
    expect(getCards).toHaveBeenCalledWith(null, null);
    expect(result).toEqual([{ id: 1, title: 'A', board_id: 10, column_id: 20, tags: [{ id: 1, name: 'bug' }] }]);
  });

  test('kaiten_find_cards passes boardId through and handles cards with no tags', async () => {
    const cards = [{ id: 1, title: 'A', board_id: 10, column_id: 20 }];
    const getCards = mock(async () => cards);
    const sdk = makeStubSdk({ getCards });
    const result = await toolByName('kaiten_find_cards').handler(sdk, { tagName: 'bug', boardId: 10 });
    expect(getCards).toHaveBeenCalledWith(null, 10);
    expect(result).toEqual([]);
  });

  test('kaiten_clean_temp extracts cardId from a dir path and returns {deleted}', async () => {
    const cleanTempDir = mock(async () => 3);
    const sdk = makeStubSdk({ cleanTempDir });
    const result = await toolByName('kaiten_clean_temp').handler(sdk, { dir: '/tmp/kaiten/456/' });
    expect(cleanTempDir).toHaveBeenCalledWith(456);
    expect(result).toEqual({ deleted: 3 });
  });

  test('kaiten_clean_temp passes null cardId when dir has no /kaiten/{id} pattern', async () => {
    const cleanTempDir = mock(async () => 7);
    const sdk = makeStubSdk({ cleanTempDir });
    const result = await toolByName('kaiten_clean_temp').handler(sdk, { dir: '/tmp/other-dir' });
    expect(cleanTempDir).toHaveBeenCalledWith(null);
    expect(result).toEqual({ deleted: 7 });
  });

  test('kaiten_clean_temp passes null cardId when dir is omitted entirely', async () => {
    const cleanTempDir = mock(async () => 0);
    const sdk = makeStubSdk({ cleanTempDir });
    const result = await toolByName('kaiten_clean_temp').handler(sdk, {});
    expect(cleanTempDir).toHaveBeenCalledWith(null);
    expect(result).toEqual({ deleted: 0 });
  });

  test('kaiten_spaces delegates to sdk.getSpaces with no args', async () => {
    const getSpaces = mock(async () => [{ id: 1, title: 'S' }]);
    const sdk = makeStubSdk({ getSpaces });
    const result = await toolByName('kaiten_spaces').handler(sdk, {});
    expect(getSpaces).toHaveBeenCalledWith();
    expect(result).toEqual([{ id: 1, title: 'S' }]);
  });

  test('kaiten_delete_card delegates to sdk.deleteCard(cardId)', async () => {
    const deleteCard = mock(async () => ({ ok: true }));
    const sdk = makeStubSdk({ deleteCard });
    await toolByName('kaiten_delete_card').handler(sdk, { cardId: 55 });
    expect(deleteCard).toHaveBeenCalledWith(55);
  });

  test('kaiten_assign_card delegates to sdk.assignTo(cardId, userId)', async () => {
    const assignTo = mock(async () => ({ success: true }));
    const sdk = makeStubSdk({ assignTo });
    await toolByName('kaiten_assign_card').handler(sdk, { cardId: 1, userId: 2 });
    expect(assignTo).toHaveBeenCalledWith(1, 2);
  });

  test('kaiten_get_child_cards delegates to sdk.getSubtasks(cardId, true)', async () => {
    const getSubtasks = mock(async () => []);
    const sdk = makeStubSdk({ getSubtasks });
    await toolByName('kaiten_get_child_cards').handler(sdk, { cardId: 4 });
    expect(getSubtasks).toHaveBeenCalledWith(4, true);
  });

  test('kaiten_get_all_child_cards delegates to sdk.getAllSubtasks(cardId, true)', async () => {
    const getAllSubtasks = mock(async () => []);
    const sdk = makeStubSdk({ getAllSubtasks });
    await toolByName('kaiten_get_all_child_cards').handler(sdk, { cardId: 4 });
    expect(getAllSubtasks).toHaveBeenCalledWith(4, true);
  });

  test('kaiten_get_parent delegates to sdk.getParent(cardId, true)', async () => {
    const getParent = mock(async () => null);
    const sdk = makeStubSdk({ getParent });
    await toolByName('kaiten_get_parent').handler(sdk, { cardId: 4 });
    expect(getParent).toHaveBeenCalledWith(4, true);
  });

  test('kaiten_update_checklist wraps name into a data object', async () => {
    const updateChecklist = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ updateChecklist });
    await toolByName('kaiten_update_checklist').handler(sdk, { cardId: 1, checklistId: 2, name: 'New name' });
    expect(updateChecklist).toHaveBeenCalledWith(1, 2, { name: 'New name' });
  });

  test('kaiten_toggle_checklist_item passes checked through', async () => {
    const toggleChecklistItem = mock(async () => ({ id: 1 }));
    const sdk = makeStubSdk({ toggleChecklistItem });
    await toolByName('kaiten_toggle_checklist_item').handler(sdk, {
      cardId: 1,
      checklistId: 2,
      itemId: 3,
      checked: false,
    });
    expect(toggleChecklistItem).toHaveBeenCalledWith(1, 2, 3, false);
  });

  test('kaiten_download_file delegates with outputDir', async () => {
    const downloadFileToDisk = mock(async () => ({ path: '/tmp/x' }));
    const sdk = makeStubSdk({ downloadFileToDisk });
    await toolByName('kaiten_download_file').handler(sdk, { cardId: 1, fileId: 2, outputDir: '/tmp/out' });
    expect(downloadFileToDisk).toHaveBeenCalledWith(1, 2, '/tmp/out');
  });

  test('kaiten_download_all_files delegates with null outputDir when omitted', async () => {
    const downloadAllCardFiles = mock(async () => []);
    const sdk = makeStubSdk({ downloadAllCardFiles });
    await toolByName('kaiten_download_all_files').handler(sdk, { cardId: 1 });
    expect(downloadAllCardFiles).toHaveBeenCalledWith(1, null);
  });

  test('kaiten_git_status delegates to sdk.getGitStatus with no args', async () => {
    const getGitStatus = mock(async () => 'clean');
    const sdk = makeStubSdk({ getGitStatus });
    const result = await toolByName('kaiten_git_status').handler(sdk, {});
    expect(getGitStatus).toHaveBeenCalledWith();
    expect(result).toBe('clean');
  });

  test('kaiten_search_users delegates to sdk.findUser(query)', async () => {
    const findUser = mock(async () => ({ id: 1, full_name: 'Alice' }));
    const sdk = makeStubSdk({ findUser });
    await toolByName('kaiten_search_users').handler(sdk, { query: 'Alice' });
    expect(findUser).toHaveBeenCalledWith('Alice');
  });
});
