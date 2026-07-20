export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * Transport contract the API resource classes depend on. `KaitenClient` is
 * the production implementation (an adapter over native `fetch`); tests
 * inject fakes so the suite never touches the network.
 */
export interface HttpTransport {
  get<T>(path: string, query?: QueryParams): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
  getBuffer(path: string): Promise<Buffer>;
}
