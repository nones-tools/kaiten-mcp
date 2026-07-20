import type { KaitenClient } from '../http/client.js';
import { BoardsApi } from './boards.js';
import { CardsApi } from './cards.js';
import { CommentsApi } from './comments.js';
import { FilesApi } from './files.js';
import { SubtasksApi } from './subtasks.js';
import { UsersApi } from './users.js';

export { BoardsApi } from './boards.js';
export { CardsApi } from './cards.js';
export { CommentsApi } from './comments.js';
export { FilesApi } from './files.js';
export { SubtasksApi } from './subtasks.js';
export { UsersApi } from './users.js';

export class KaitenApi {
  readonly cards: CardsApi;
  readonly boards: BoardsApi;
  readonly comments: CommentsApi;
  readonly files: FilesApi;
  readonly subtasks: SubtasksApi;
  readonly users: UsersApi;

  constructor(client: KaitenClient) {
    this.cards = new CardsApi(client);
    this.boards = new BoardsApi(client);
    this.comments = new CommentsApi(client);
    this.files = new FilesApi(client);
    this.subtasks = new SubtasksApi(client);
    this.users = new UsersApi(client);
  }
}
