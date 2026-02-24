import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../client.js', () => ({
  memosRequest: vi.fn(),
}));

import { memosRequest } from '../client.js';
import { createMemo } from './create-memo.js';

const mockRequest = vi.mocked(memosRequest);

describe('createMemo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('creates a memo with default PRIVATE visibility', async () => {
    mockRequest.mockResolvedValueOnce({
      name: 'memos/abc',
      content: 'hello world',
      visibility: 'PRIVATE',
      state: 'NORMAL',
    });

    const result = await createMemo({ content: 'hello world' });

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/memos', {
      method: 'POST',
      body: JSON.stringify({
        content: 'hello world',
        visibility: 'PRIVATE',
        state: 'NORMAL',
      }),
    });
    expect(result.name).toBe('memos/abc');
  });

  it('creates a memo with explicit PUBLIC visibility', async () => {
    mockRequest.mockResolvedValueOnce({
      name: 'memos/def',
      content: 'public note',
      visibility: 'PUBLIC',
      state: 'NORMAL',
    });

    const result = await createMemo({
      content: 'public note',
      visibility: 'PUBLIC',
    });

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/memos', {
      method: 'POST',
      body: JSON.stringify({
        content: 'public note',
        visibility: 'PUBLIC',
        state: 'NORMAL',
      }),
    });
    expect(result.visibility).toBe('PUBLIC');
  });

  it('throws on empty content', async () => {
    await expect(createMemo({ content: '' })).rejects.toThrow(
      'content must not be empty'
    );
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
