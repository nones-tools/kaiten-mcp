# SDK

The package root exports a typed SDK for Node/Bun (>= 18):

```ts
import { createSDK } from '@nones/kaiten-mcp';

const sdk = createSDK();                 // config from env/files (see configuration.md)
// or with explicit overrides:
const sdk2 = createSDK({ apiUrl: '...', apiToken: '...' });

const cards = await sdk.getCards(spaceId, boardId, /* minimal */ true);
const card  = await sdk.getCard(cardId);
await sdk.createCard({ title: 'Task', boardId, columnId, laneId });
await sdk.moveToColumn(cardId, columnId, laneId);
await sdk.assignTo(cardId, userId);
await sdk.addComment(cardId, 'Done!');
await sdk.addTag(cardId, 'release');
const kids = await sdk.getAllSubtasks(cardId, /* minimal */ true);
```

## Surface

- **Cards**: `getCards`, `getCard`, `createCard`, `updateCard`, `deleteCard`,
  `moveToColumn`, `assignTo`, `unassignFrom`, `archive`, `unarchive`
- **Tags**: `addTag`, `removeTag`, `setTags`, `hasTag`, `getTags`, `getCardsWithTag`,
  `getCardsWithoutTag`
- **Hierarchy**: `createSubtask`, `getSubtasks`, `getAllSubtasks`, `getParent`,
  `attachToParent`, `detachFromParent`, `createTaskFlow`
- **Comments**: `addComment`, `getComments`, `updateComment`, `deleteComment`
- **Checklists**: `getChecklists`, `createChecklist`, `updateChecklist`,
  `deleteChecklist`, `addChecklistItem`, `toggleChecklistItem`, `deleteChecklistItem`
- **Files**: `getCardFiles`, `downloadFile`, `downloadFileToDisk`,
  `downloadAllCardFiles`, `cleanTempDir`
- **Navigation/users**: `getSpaces`, `getSpaceId`, `getBoards`, `getBoardId`,
  `getColumns`, `getColumnId`, `getUsers`, `findUser`, `getCurrentUser`
- **Git**: `createGitBranch`, `checkoutGitBranch`, `commitGit`, `getGitStatus`,
  `gitPush`, `getCurrentBranch`

Errors from the Kaiten API throw `KaitenApiError` with `status` and parsed `body`.

## Lower level

For direct endpoint access without SDK conveniences (allowlists, projections):

```ts
import { KaitenClient, KaitenApi, loadConfig } from '@nones/kaiten-mcp';

const config = loadConfig();
const client = new KaitenClient({ apiUrl: config.apiUrl, apiToken: config.apiToken });
const api = new KaitenApi(client);
const spaces = await api.boards.getSpaces();
```

`KaitenClient` accepts an injectable `fetchImpl` — that is how the test suite runs
without a network. All Kaiten entity types (`Card`, `Board`, `Column`, `User`,
`Checklist`, …) are exported from the package root.
