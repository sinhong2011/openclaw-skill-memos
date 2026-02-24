import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../client.js', () => ({
  memosRequest: vi.fn(),
}));

import { memosRequest } from '../client.js';
import { getMemo } from './get-memo.js';

const mockRequest = vi.mocked(memosRequest);

describe('getMemo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('gets a memo by id', async () => {
    mockRequest.mockResolvedValueOnce({
      name: 'memos/abc',
      content: 'test',
    });

    const result = await getMemo({ id: 'abc' });

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/memos/abc');
    expect(result.name).toBe('memos/abc');
  });

  it('throws on empty id', async () => {
    await expect(getMemo({ id: '' })).rejects.toThrow('id must not be empty');
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
