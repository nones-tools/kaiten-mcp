export class KaitenApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Kaiten API request failed with status ${status}`);
    this.name = 'KaitenApiError';
    this.status = status;
    this.body = body;
  }
}
