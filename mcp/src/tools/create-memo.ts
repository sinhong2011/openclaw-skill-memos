import { memosRequest } from '../client.js';
import type { Memo, Visibility } from '../types.js';

export interface CreateMemoArgs {
  content: string;
  visibility?: Visibility;
}

export async function createMemo(args: CreateMemoArgs): Promise<Memo> {
  if (!args.content) {
    throw new Error('content must not be empty');
  }

  return memosRequest<Memo>('/api/v1/memos', {
    method: 'POST',
    body: JSON.stringify({
      content: args.content,
      visibility: args.visibility ?? 'PRIVATE',
      state: 'NORMAL',
    }),
  });
}
