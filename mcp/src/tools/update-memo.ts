import { memosRequest } from '../client.js';
import type { Memo, Visibility } from '../types.js';

export interface UpdateMemoArgs {
  id: string;
  content?: string;
  visibility?: Visibility;
  pinned?: boolean;
}

export async function updateMemo(args: UpdateMemoArgs): Promise<Memo> {
  if (!args.id) {
    throw new Error('id must not be empty');
  }

  const body: Record<string, unknown> = {};
  const fields: string[] = [];

  if (args.content !== undefined) {
    body.content = args.content;
    fields.push('content');
  }
  if (args.visibility !== undefined) {
    body.visibility = args.visibility;
    fields.push('visibility');
  }
  if (args.pinned !== undefined) {
    body.pinned = args.pinned;
    fields.push('pinned');
  }

  if (fields.length === 0) {
    throw new Error('at least one field to update is required');
  }

  const mask = encodeURIComponent(fields.join(','));
  return memosRequest<Memo>(`/api/v1/memos/${args.id}?updateMask=${mask}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
