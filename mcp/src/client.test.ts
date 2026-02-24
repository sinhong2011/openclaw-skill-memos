import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('memosRequest', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env = { ...originalEnv };
    process.env.MEMOS_API_URL = 'http://localhost:5230';
    process.env.MEMOS_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sends GET request with auth header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: 'memos/1' }),
    });

    const { memosRequest } = await import('./client.js');
    const result = await memosRequest('/api/v1/memos/1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5230/api/v1/memos/1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual({ name: 'memos/1' });
  });

  it('sends POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: 'memos/2', content: 'hello' }),
    });

    const { memosRequest } = await import('./client.js');
    const result = await memosRequest('/api/v1/memos', {
      method: 'POST',
      body: JSON.stringify({ content: 'hello' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5230/api/v1/memos',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual({ name: 'memos/2', content: 'hello' });
  });

  it('throws on non-OK response with error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'unauthorized' }),
    });

    const { memosRequest } = await import('./client.js');
    await expect(memosRequest('/api/v1/memos')).rejects.toThrow(
      'Memos API error (401): unauthorized'
    );
  });

  it('returns empty object for 204 No Content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { memosRequest } = await import('./client.js');
    const result = await memosRequest('/api/v1/memos/1', { method: 'DELETE' });
    expect(result).toEqual({});
  });
});
