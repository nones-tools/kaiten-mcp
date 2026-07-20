import { KaitenApi } from './kaiten/api/index.js';
import { loadConfig, type KaitenConfig } from './kaiten/config.js';
import { KaitenClient } from './kaiten/http/client.js';
import type { Board, Card, CardFile, Checklist, ChecklistItem, Column, Comment, Lane, Space, User } from './kaiten/interfaces/index.js';
import { BoardService } from './services/board.service.js';
import { CardService, type CreateCardInput } from './services/card.service.js';
import { ChecklistService } from './services/checklist.service.js';
import { CommentService } from './services/comment.service.js';
import { FileService } from './services/file.service.js';
import { GitService } from './services/git.service.js';
import { AccessGuard } from './services/guard.js';
import { HierarchyService, type TaskFlowTask } from './services/hierarchy.service.js';
import type { MinimalCard, MinimalParent, MinimalSubtask, TaggedCard } from './services/projections.js';
import { TagService } from './services/tag.service.js';
import { UserService } from './services/user.service.js';

export type { CreateCardInput } from './services/card.service.js';
export type { TaskFlowTask } from './services/hierarchy.service.js';
export type { MinimalCard, MinimalParent, MinimalSubtask, TaggedCard } from './services/projections.js';

export interface KaitenSDKOptions extends Partial<KaitenConfig> {
  client?: KaitenClient;
}

/**
 * Facade over the Kaiten Core plus the business-logic services in
 * src/services/ (allowlist guard, minimal projections, domain services,
 * git/temp helpers). Constructs core client/api + AccessGuard + services;
 * every public method is a one-line delegation. This is the package's
 * public API - adapters (MCP, CLI) call this and never raw HTTP.
 */
export class KaitenSDK {
  readonly config: KaitenConfig;
  readonly client: KaitenClient;
  readonly api: KaitenApi;

  private readonly cards: CardService;
  private readonly tags: TagService;
  private readonly hierarchy: HierarchyService;
  private readonly comments: CommentService;
  private readonly boards: BoardService;
  private readonly users: UserService;
  private readonly git: GitService;
  private readonly files: FileService;
  private readonly checklists: ChecklistService;

  constructor(options: KaitenSDKOptions = {}) {
    const { client, ...configOverrides } = options;
    this.config = loadConfig(configOverrides);
    this.client =
      client ??
      new KaitenClient({ apiUrl: this.config.apiUrl, apiToken: this.config.apiToken, allowDelete: this.config.deleteAllow });
    this.api = new KaitenApi(this.client);

    const guard = new AccessGuard(this.api, this.config);
    this.cards = new CardService(this.api, guard, this.config);
    this.tags = new TagService(this.api, guard, this.cards);
    this.hierarchy = new HierarchyService(this.api, guard, this.cards);
    this.comments = new CommentService(this.api, guard);
    this.boards = new BoardService(this.api, guard, this.config);
    this.users = new UserService(this.api);
    this.git = new GitService(this.api);
    this.files = new FileService(this.api, guard);
    this.checklists = new ChecklistService(this.api, guard);
  }

  // Cards
  getCards(spaceId: number | null = null, boardId: number | null = null, minimal = false): Promise<Card[] | MinimalCard[]> { return this.cards.getCards(spaceId, boardId, minimal); }
  getCard(cardId: number, minimal = false): Promise<Card | MinimalCard> { return this.cards.getCard(cardId, minimal); }
  createCard(input: CreateCardInput): Promise<Card> { return this.cards.createCard(input); }
  updateCard(cardId: number, data: Record<string, unknown>): Promise<Card> { return this.cards.updateCard(cardId, data); }
  deleteCard(cardId: number): Promise<unknown> { return this.cards.deleteCard(cardId); }
  moveToColumn(cardId: number, columnId: number, laneId: number | null = null) { return this.cards.moveToColumn(cardId, columnId, laneId); }
  assignTo(cardId: number, userId: number) { return this.cards.assignTo(cardId, userId); }
  unassignFrom(cardId: number, userId: number): Promise<Card> { return this.cards.unassignFrom(cardId, userId); }
  archive(cardId: number): Promise<Card> { return this.cards.archive(cardId); }
  unarchive(cardId: number): Promise<Card> { return this.cards.unarchive(cardId); }

  // Tags
  addTag(cardId: number, tagName: string): Promise<TaggedCard> { return this.tags.addTag(cardId, tagName); }
  removeTag(cardId: number, tagName: string): Promise<TaggedCard> { return this.tags.removeTag(cardId, tagName); }
  setTags(cardId: number, tagNames: string[]): Promise<Card> { return this.tags.setTags(cardId, tagNames); }
  hasTag(card: Card, tagName: string): boolean { return this.tags.hasTag(card, tagName); }
  getTags(card: Card): string[] { return this.tags.getTags(card); }
  getCardsWithTag(tagName: string, spaceId: number | null = null): Promise<Card[]> { return this.tags.getCardsWithTag(tagName, spaceId); }
  getCardsWithoutTag(tagName: string, spaceId: number | null = null): Promise<Card[]> { return this.tags.getCardsWithoutTag(tagName, spaceId); }

  // Hierarchy (subtasks / parents)
  createSubtask(parentId: number, title: string, position = 0): Promise<Card> { return this.hierarchy.createSubtask(parentId, title, position); }
  getSubtasks(cardId: number, minimal = false): Promise<Card[] | MinimalSubtask[]> { return this.hierarchy.getSubtasks(cardId, minimal); }
  getAllSubtasks(cardId: number, minimal = false): Promise<Card[] | MinimalSubtask[]> { return this.hierarchy.getAllSubtasks(cardId, minimal); }
  getParent(cardId: number, minimal = false): Promise<Card | MinimalParent | null> { return this.hierarchy.getParent(cardId, minimal); }
  attachToParent(cardId: number, parentId: number, position = 0): Promise<unknown> { return this.hierarchy.attachToParent(cardId, parentId, position); }
  detachFromParent(cardId: number): Promise<unknown> { return this.hierarchy.detachFromParent(cardId); }
  createTaskFlow(parentCard: number, tasks: TaskFlowTask[]): Promise<Record<string, unknown>[]> { return this.hierarchy.createTaskFlow(parentCard, tasks); }

  // Comments
  addComment(cardId: number, text: string, parentId: number | null = null): Promise<Comment> { return this.comments.addComment(cardId, text, parentId); }
  getComments(cardId: number): Promise<Comment[]> { return this.comments.getComments(cardId); }
  updateComment(commentId: number, text: string): Promise<Comment> { return this.comments.updateComment(commentId, text); }
  deleteComment(commentId: number): Promise<void> { return this.comments.deleteComment(commentId); }

  // Boards / spaces / columns
  getSpaces(): Promise<Space[]> { return this.boards.getSpaces(); }
  getSpaceId(spaceTitle: string | number): Promise<number> { return this.boards.getSpaceId(spaceTitle); }
  getBoardId(spaceId: number, boardTitle: string): Promise<number> { return this.boards.getBoardId(spaceId, boardTitle); }
  getColumnId(boardId: number, columnTitle: string): Promise<number> { return this.boards.getColumnId(boardId, columnTitle); }
  getBoards(spaceId: number | null = null): Promise<Board[]> { return this.boards.getBoards(spaceId); }
  getColumns(boardId: number): Promise<Column[]> { return this.boards.getColumns(boardId); }
  getLanes(boardId: number): Promise<Lane[]> { return this.boards.getLanes(boardId); }

  // Users
  findUser(query: string): Promise<User> { return this.users.findUser(query); }
  getCurrentUser(): Promise<User> { return this.users.getCurrentUser(); }
  getUsers(): Promise<User[]> { return this.users.getUsers(); }

  // Git
  getCurrentBranch(): Promise<string> { return this.git.getCurrentBranch(); }
  createGitBranch(cardId: number, title?: string): Promise<string> { return this.git.createGitBranch(cardId, title); }
  checkoutGitBranch(cardId: number, title?: string): Promise<string> { return this.git.checkoutGitBranch(cardId, title); }
  commitGit(cardId: number, message: string): Promise<void> { return this.git.commitGit(cardId, message); }
  getGitChanges(): Promise<string> { return this.git.getGitChanges(); }
  getGitStatus(): Promise<string> { return this.git.getGitStatus(); }
  gitAddAll(): Promise<void> { return this.git.gitAddAll(); }
  gitPush(cardId: number, title?: string): Promise<void> { return this.git.gitPush(cardId, title); }
  createPullRequest(cardId: number, title: string): Promise<void> { return this.git.createPullRequest(cardId, title); }

  // Files / temp dirs
  getCardFiles(cardId: number): Promise<CardFile[]> { return this.files.getCardFiles(cardId); }
  downloadFile(cardId: number, fileId: number): Promise<Buffer> { return this.files.downloadFile(cardId, fileId); }
  downloadFileToDisk(cardId: number, fileId: number, outputDir: string | null = null) { return this.files.downloadFileToDisk(cardId, fileId, outputDir); }
  downloadAllCardFiles(cardId: number, outputDir: string | null = null) { return this.files.downloadAllCardFiles(cardId, outputDir); }
  cleanTempDir(cardId: number | null = null): Promise<number> { return this.files.cleanTempDir(cardId); }

  // Checklists
  getChecklists(cardId: number): Promise<Checklist[]> { return this.checklists.getChecklists(cardId); }
  createChecklist(cardId: number, name: string): Promise<Checklist> { return this.checklists.createChecklist(cardId, name); }
  deleteChecklist(cardId: number, checklistId: number): Promise<unknown> { return this.checklists.deleteChecklist(cardId, checklistId); }
  updateChecklist(cardId: number, checklistId: number, data: Record<string, unknown>): Promise<Checklist> { return this.checklists.updateChecklist(cardId, checklistId, data); }
  toggleChecklistItem(cardId: number, checklistId: number, itemId: number, checked: boolean): Promise<ChecklistItem> { return this.checklists.toggleChecklistItem(cardId, checklistId, itemId, checked); }
  addChecklistItem(cardId: number, checklistId: number, text: string): Promise<ChecklistItem> { return this.checklists.addChecklistItem(cardId, checklistId, text); }
  deleteChecklistItem(cardId: number, checklistId: number, itemId: number): Promise<unknown> { return this.checklists.deleteChecklistItem(cardId, checklistId, itemId); }
}

export function createSDK(options?: KaitenSDKOptions): KaitenSDK {
  return new KaitenSDK(options);
}
