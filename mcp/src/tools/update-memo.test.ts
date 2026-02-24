import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../client.js', () => ({
  memosRequest: vi.fn(),
}));

import { memosRequest } from '../client.js';
import { updateMemo } from './update-memo.js';

const mockRequest = vi.mocked(memosRequest);

describe('updateMemo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('updates content only', async () => {
    mockRequest.mockResolvedValueOnce({
      name: 'memos/abc',
      content: 'updated',
    });

    await updateMemo({ id: 'abc', content: 'updated' });

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/memos/abc?updateMask=content',
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'updated' }),
      }
    );
  });

  it('updates multiple fields with correct updateMask', async () => {
    mockRequest.mockResolvedValueOnce({ name: 'memos/abc' });

    await updateMemo({
      id: 'abc',
      content: 'new content',
      visibility: 'PUBLIC',
      pinned: true,
    });

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/memos/abc?updateMask=content%2Cvisibility%2Cpinned',
      {
        method: 'PATCH',
        body: JSON.stringify({
          content: 'new content',
          visibility: 'PUBLIC',
          pinned: true,
        }),
      }
    );
  });

  it('throws on empty id', async () => {
    await expect(updateMemo({ id: '' })).rejects.toThrow('id must not be empty');
  });

  it('throws when no fields to update', async () => {
    await expect(updateMemo({ id: 'abc' })).rejects.toThrow(
      'at least one field to update is required'
    );
  });
});
