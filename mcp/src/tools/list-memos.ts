import { memosRequest } from '../client.js';
import type { MemoList } from '../types.js';

export interface ListMemosArgs {
  pageSize?: number;
  pageToken?: string;
  filter?: string;
}

export async function listMemos(args: ListMemosArgs): Promise<MemoList> {
  const params = new URLSearchParams();
  params.set('pageSize', String(args.pageSize ?? 20));
  if (args.pageToken) params.set('pageToken', args.pageToken);
  if (args.filter) params.set('filter', args.filter);

  return memosRequest<MemoList>(`/api/v1/memos?${params.toString()}`);
}
