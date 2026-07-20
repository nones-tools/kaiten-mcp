/**
 * Kaiten SDK configuration shape, as produced by `loadConfig()`.
 */
export interface KaitenConfig {
  apiUrl: string;
  apiToken: string;
  defaultSpaceId: number | null;
  defaultBoardId: number | null;
  allowedSpaceIds: number[] | null;
  allowedBoardIds: number[] | null;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}
