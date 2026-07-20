/**
 * Kaiten board/space entity types. See card.ts for the modeling rationale.
 */

export interface Space {
  id: number;
  title: string;
  [key: string]: unknown;
}

export interface Board {
  id: number;
  title: string;
  [key: string]: unknown;
}

export interface Column {
  id: number;
  title: string;
  [key: string]: unknown;
}
