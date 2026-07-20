import type { HttpTransport, QueryParams } from '../interfaces';
import { KaitenApiError, KaitenDeleteDisabledError } from './errors';

export interface KaitenClientOptions {
  apiUrl: string;
  apiToken: string;
  fetchImpl?: typeof fetch;
  /**
   * Explicit opt-in for HTTP DELETE calls. Defaults to `false` - `delete()`
   * throws `KaitenDeleteDisabledError` before making any request unless this
   * is `true`. This is the single enforcement point: every DELETE anywhere
   * in the API layer goes through `KaitenClient.delete()`, so nothing can
   * bypass the gate.
   */
  allowDelete?: boolean;
}

export type { QueryParams } from '../interfaces';

/** Adapts native `fetch` to the `HttpTransport` contract the API layer uses. */
export class KaitenClient implements HttpTransport {
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly fetchImpl: typeof fetch;
  private readonly allowDelete: boolean;

  constructor(options: KaitenClientOptions) {
    this.apiUrl = options.apiUrl.replace(/\/+$/, '');
    this.apiToken = options.apiToken;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
    this.allowDelete = options.allowDelete ?? false;
  }

  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(this.apiUrl + (path.startsWith('/') ? path : `/${path}`));
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    { query, body }: { query?: QueryParams; body?: unknown } = {}
  ): Promise<T> {
    const response = await this.fetchImpl(this.buildUrl(path, query), {
      method,
      headers: this.headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await this.parseBody(response);
      throw new KaitenApiError(
        response.status,
        errorBody,
        `Kaiten API request failed: ${method} ${path} -> ${response.status}`
      );
    }

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('GET', path, { query });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, { body });
  }

  async delete<T>(path: string): Promise<T> {
    if (!this.allowDelete) throw new KaitenDeleteDisabledError();
    return this.request<T>('DELETE', path);
  }

  /**
   * PUT with a `FormData` body (multipart file upload). Deliberately omits
   * `Content-Type` - `fetch` derives `multipart/form-data; boundary=...`
   * from the `FormData` instance itself; setting it manually would drop the
   * boundary and break the upload.
   */
  async putForm<T>(path: string, form: FormData): Promise<T> {
    const response = await this.fetchImpl(this.buildUrl(path), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${this.apiToken}`, Accept: 'application/json' },
      body: form,
    });

    if (!response.ok) {
      const errorBody = await this.parseBody(response);
      throw new KaitenApiError(response.status, errorBody, `Kaiten API request failed: PUT ${path} -> ${response.status}`);
    }

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  async getBuffer(path: string): Promise<Buffer> {
    const response = await this.fetchImpl(this.buildUrl(path), {
      method: 'GET',
      headers: this.headers(),
    });

    if (!response.ok) {
      const errorBody = await this.parseBody(response);
      throw new KaitenApiError(
        response.status,
        errorBody,
        `Kaiten API request failed: GET ${path} -> ${response.status}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
