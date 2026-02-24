import { memosRequest } from '../client.js';

export interface DeleteMemoArgs {
  id: string;
}

export async function deleteMemo(
  args: DeleteMemoArgs
): Promise<{ deleted: boolean }> {
  if (!args.id) {
    throw new Error('id must not be empty');
  }

  await memosRequest(`/api/v1/memos/${args.id}`, { method: 'DELETE' });
  return { deleted: true };
}
