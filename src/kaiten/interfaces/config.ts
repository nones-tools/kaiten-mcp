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
  /**
   * Explicit opt-in gate for HTTP DELETE calls to the Kaiten API. Only `true`
   * when `KAITEN_API_DELETE_ALLOW` is exactly `'true'` (case-insensitive).
   * Not part of the required-config check - safe default is `false`.
   */
  deleteAllow: boolean;
}
