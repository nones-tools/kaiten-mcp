import type { Board, Column, Space } from '../../kaiten/interfaces/board.js';
import * as boardOps from '../boards.js';
import type { SdkContext } from '../context.js';
import type { Constructor } from '../mixin-utils.js';

export function BoardsMixin<TBase extends Constructor<SdkContext>>(Base: TBase) {
  return class extends Base {
    getSpaces(): Promise<Space[]> {
      return boardOps.getSpaces(this);
    }

    getSpaceId(spaceTitle: string | number): Promise<number> {
      return boardOps.getSpaceId(this, spaceTitle);
    }

    getBoardId(spaceId: number, boardTitle: string): Promise<number> {
      return boardOps.getBoardId(this, spaceId, boardTitle);
    }

    getColumnId(boardId: number, columnTitle: string): Promise<number> {
      return boardOps.getColumnId(this, boardId, columnTitle);
    }

    getBoards(spaceId: number | null = null): Promise<Board[]> {
      return boardOps.getBoards(this, spaceId);
    }

    getColumns(boardId: number): Promise<Column[]> {
      return boardOps.getColumns(this, boardId);
    }
  };
}
