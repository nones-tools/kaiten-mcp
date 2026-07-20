import type { HttpTransport } from '../interfaces/http.js';
import { BlockersApi } from './blockers.js';
import { BoardsApi } from './boards.js';
import { CardsApi } from './cards.js';
import { CommentsApi } from './comments.js';
import { CompanyApi } from './company.js';
import { FilesApi } from './files.js';
import { LinksApi } from './links.js';
import { SubtasksApi } from './subtasks.js';
import { TimeLogsApi } from './timelogs.js';
import { UsersApi } from './users.js';

export { BlockersApi } from './blockers.js';
export { BoardsApi } from './boards.js';
export { CardsApi } from './cards.js';
export { CommentsApi } from './comments.js';
export { CompanyApi } from './company.js';
export { FilesApi } from './files.js';
export { LinksApi } from './links.js';
export { SubtasksApi } from './subtasks.js';
export { TimeLogsApi } from './timelogs.js';
export { UsersApi } from './users.js';

export class KaitenApi {
  readonly cards: CardsApi;
  readonly boards: BoardsApi;
  readonly comments: CommentsApi;
  readonly files: FilesApi;
  readonly subtasks: SubtasksApi;
  readonly users: UsersApi;
  readonly timeLogs: TimeLogsApi;
  readonly blockers: BlockersApi;
  readonly links: LinksApi;
  readonly company: CompanyApi;

  constructor(client: HttpTransport) {
    this.cards = new CardsApi(client);
    this.boards = new BoardsApi(client);
    this.comments = new CommentsApi(client);
    this.files = new FilesApi(client);
    this.subtasks = new SubtasksApi(client);
    this.users = new UsersApi(client);
    this.timeLogs = new TimeLogsApi(client);
    this.blockers = new BlockersApi(client);
    this.links = new LinksApi(client);
    this.company = new CompanyApi(client);
  }
}
