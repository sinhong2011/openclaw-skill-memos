import { z } from 'zod';
import { createMemo } from './create-memo.js';
import { listMemos } from './list-memos.js';
import { getMemo } from './get-memo.js';
import { updateMemo } from './update-memo.js';
import { deleteMemo } from './delete-memo.js';

export const toolDefinitions = [
  {
    name: 'memos_create',
    description:
      'Create a new memo. Content is Markdown. Visibility defaults to PRIVATE.',
    inputSchema: z.object({
      content: z.string().describe('Memo body in Markdown format'),
      visibility: z
        .enum(['PRIVATE', 'PROTECTED', 'PUBLIC'])
        .optional()
        .describe('Access level (default: PRIVATE)'),
    }),
  },
  {
    name: 'memos_list',
    description:
      'List memos with optional filtering and pagination.',
    inputSchema: z.object({
      pageSize: z
        .number()
        .optional()
        .describe('Results per page (default: 20)'),
      pageToken: z.string().optional().describe('Pagination cursor'),
      filter: z
        .string()
        .optional()
        .describe('CEL filter expression, e.g. "tag == \\"work\\""'),
    }),
  },
  {
    name: 'memos_get',
    description: 'Get a single memo by ID.',
    inputSchema: z.object({
      id: z.string().describe('Memo ID (the part after "memos/" in the resource name)'),
    }),
  },
  {
    name: 'memos_update',
    description:
      'Update an existing memo. Only specified fields are changed.',
    inputSchema: z.object({
      id: z.string().describe('Memo ID'),
      content: z.string().optional().describe('New content in Markdown'),
      visibility: z
        .enum(['PRIVATE', 'PROTECTED', 'PUBLIC'])
        .optional()
        .describe('New visibility'),
      pinned: z.boolean().optional().describe('Pin or unpin the memo'),
    }),
  },
  {
    name: 'memos_delete',
    description: 'Delete a memo by ID. This action is irreversible.',
    inputSchema: z.object({
      id: z.string().describe('Memo ID to delete'),
    }),
  },
];

export async function dispatchTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'memos_create':
      return createMemo(args as { content: string; visibility?: 'PRIVATE' | 'PROTECTED' | 'PUBLIC' });
    case 'memos_list':
      return listMemos(args as { pageSize?: number; pageToken?: string; filter?: string });
    case 'memos_get':
      return getMemo(args as { id: string });
    case 'memos_update':
      return updateMemo(args as { id: string; content?: string; visibility?: 'PRIVATE' | 'PROTECTED' | 'PUBLIC'; pinned?: boolean });
    case 'memos_delete':
      return deleteMemo(args as { id: string });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
