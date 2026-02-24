import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../client.js', () => ({
  memosRequest: vi.fn(),
}));

import { memosRequest } from '../client.js';
import { deleteMemo } from './delete-memo.js';

const mockRequest = vi.mocked(memosRequest);

describe('deleteMemo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('deletes a memo by id', async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await deleteMemo({ id: 'abc' });

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/memos/abc', {
      method: 'DELETE',
    });
    expect(result).toEqual({ deleted: true });
  });

  it('throws on empty id', async () => {
    await expect(deleteMemo({ id: '' })).rejects.toThrow('id must not be empty');
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
