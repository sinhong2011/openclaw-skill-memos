import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../client.js', () => ({
  memosRequest: vi.fn(),
}));

import { memosRequest } from '../client.js';
import { listMemos } from './list-memos.js';

const mockRequest = vi.mocked(memosRequest);

describe('listMemos', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('lists memos with default page size', async () => {
    mockRequest.mockResolvedValueOnce({
      memos: [{ name: 'memos/1' }],
      nextPageToken: '',
    });

    const result = await listMemos({});

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/memos?pageSize=20'
    );
    expect(result.memos).toHaveLength(1);
  });

  it('lists memos with custom page size and filter', async () => {
    mockRequest.mockResolvedValueOnce({
      memos: [],
      nextPageToken: '',
    });

    await listMemos({ pageSize: 5, filter: 'visibility == "PUBLIC"' });

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/memos?pageSize=5&filter=visibility+%3D%3D+%22PUBLIC%22'
    );
  });

  it('passes pageToken for pagination', async () => {
    mockRequest.mockResolvedValueOnce({
      memos: [],
      nextPageToken: '',
    });

    await listMemos({ pageToken: 'abc123' });

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/memos?pageSize=20&pageToken=abc123'
    );
  });
});
