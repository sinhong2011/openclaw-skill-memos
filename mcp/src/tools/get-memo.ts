import { memosRequest } from '../client.js';
import type { Memo } from '../types.js';

export interface GetMemoArgs {
  id: string;
}

export async function getMemo(args: GetMemoArgs): Promise<Memo> {
  if (!args.id) {
    throw new Error('id must not be empty');
  }

  return memosRequest<Memo>(`/api/v1/memos/${args.id}`);
}
