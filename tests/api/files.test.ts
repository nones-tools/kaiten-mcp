import { describe, expect, it } from 'bun:test';
import { FilesApi } from '../../src/kaiten/api/files.js';
import { createFakeFetch, makeClient, type Call } from './helpers.js';

describe('FilesApi', () => {
  it('getCardFiles GETs /cards/{id}/files', async () => {
    const { fetchImpl, calls } = createFakeFetch([{ body: [] }]);
    const api = new FilesApi(makeClient(fetchImpl));
    await api.getCardFiles(5);
    expect(calls[0]!.url).toBe('https://api.example.com/cards/5/files');
  });

  it('downloadFile GETs /cards/{id}/files/{fileId} and returns a Buffer', async () => {
    const calls: Call[] = [];
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ method: init?.method ?? 'GET', url: String(input), body: undefined });
      return new Response(new TextEncoder().encode('file-contents'), { status: 200 });
    }) as unknown as typeof fetch;
    const api = new FilesApi(makeClient(fetchImpl));
    const buf = await api.downloadFile(5, 9);
    expect(calls[0]!.url).toBe('https://api.example.com/cards/5/files/9');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.toString()).toBe('file-contents');
  });
});
