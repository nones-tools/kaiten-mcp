import type { Board, Column, Space } from '../kaiten/interfaces/board.js';
import type { SdkContext } from './context.js';
import { validateBoardId, validateSpaceId } from './guard.js';

export async function getSpaces(ctx: SdkContext): Promise<Space[]> {
  const spaces = await ctx.api.boards.getSpaces();
  if (!ctx.config.allowedSpaceIds) return spaces;
  return spaces.filter((s) => ctx.config.allowedSpaceIds!.includes(s.id));
}

export async function getSpaceId(ctx: SdkContext, spaceTitle: string | number): Promise<number> {
  const spaces = await ctx.api.boards.getSpaces();
  const space = spaces.find((s) => s.title === spaceTitle || s.id === spaceTitle);
  if (!space) {
    throw new Error(`Space "${spaceTitle}" not found`);
  }
  return space.id;
}

/** Note: shadows nothing - the old SDK had a dead first `getBoardId(boardTitle, spaceId)` overload
 * that was silently overridden by this one (JS classes allow duplicate method names; the last
 * definition wins at runtime). This is the only definition that was ever actually callable. */
export async function getBoardId(ctx: SdkContext, spaceId: number, boardTitle: string): Promise<number> {
  const boards = await ctx.api.boards.getBoards(spaceId);
  const board = boards.find((b) => b.title === boardTitle);
  if (!board) {
    throw new Error(`Board "${boardTitle}" not found`);
  }
  return board.id;
}

export async function getColumnId(ctx: SdkContext, boardId: number, columnTitle: string): Promise<number> {
  validateBoardId(ctx, boardId);
  const columns = await ctx.api.boards.getColumns(boardId);
  const column = columns.find((c) => c.title === columnTitle);
  if (!column) {
    throw new Error(`Column "${columnTitle}" not found`);
  }
  return column.id;
}

export function getBoards(ctx: SdkContext, spaceId: number | null = null): Promise<Board[]> {
  const id = spaceId || ctx.config.defaultSpaceId;
  if (!id) {
    throw new Error('Space ID is required. Set KAITEN_DEFAULT_SPACE_ID or pass spaceId parameter.');
  }
  validateSpaceId(ctx, id);
  return ctx.api.boards.getBoards(id);
}

export function getColumns(ctx: SdkContext, boardId: number): Promise<Column[]> {
  validateBoardId(ctx, boardId);
  return ctx.api.boards.getColumns(boardId);
}
