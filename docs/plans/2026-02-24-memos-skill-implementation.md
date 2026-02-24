# OpenClaw Memos Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone open-source project with an MCP server (`openclaw-memos-mcp`) for full CRUD on Memos, plus an OpenClaw skill (`SKILL.md`) for ClawHub.

**Architecture:** Monorepo with `mcp/` (TypeScript MCP server published to npm) and `skill/` (markdown skill published to ClawHub). The MCP server uses `@modelcontextprotocol/sdk` v1.x with zod schemas, native `fetch`, and `dotenv` for config. Follows the same patterns as `rsshub-routegen-mcp`.

**Tech Stack:** TypeScript, Node 20+, `@modelcontextprotocol/sdk` ^1.12.0, `zod` ^3.24.0, `dotenv` ^16.4.0, `vitest` ^3.0.0, `tsx` ^4.19.0

**Design doc:** `docs/plans/2026-02-24-memos-skill-design.md`

---

### Task 1: Project Scaffold

**Files:**
- Create: `mcp/package.json`
- Create: `mcp/tsconfig.json`
- Create: `mcp/vitest.config.ts`
- Create: `mcp/.env.example`
- Create: `.gitignore`
- Create: `LICENSE`

**Step 1: Create `mcp/package.json`**

```json
{
  "name": "openclaw-memos-mcp",
  "version": "0.1.0",
  "description": "MCP server for full CRUD operations on a Memos instance",
  "type": "module",
  "bin": {
    "openclaw-memos-mcp": "dist/index.js"
  },
  "main": "dist/index.js",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "keywords": ["mcp", "memos", "usememos", "notes", "openclaw"],
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "dotenv": "^16.4.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

**Step 2: Create `mcp/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 3: Create `mcp/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

**Step 4: Create `mcp/.env.example`**

```
MEMOS_API_URL=http://localhost:5230
MEMOS_TOKEN=your-access-token-here
```

**Step 5: Create `.gitignore`**

```
node_modules/
dist/
.env
*.tsbuildinfo
```

**Step 6: Create `LICENSE`**

MIT license with year 2026 and copyright holder `sinhong2011`.

**Step 7: Install dependencies**

Run: `cd mcp && npm install`
Expected: `node_modules/` created, `package-lock.json` generated.

**Step 8: Verify setup**

Run: `cd mcp && npx tsc --noEmit`
Expected: No errors (no source files yet, should succeed silently).

**Step 9: Commit**

```bash
git add .gitignore LICENSE mcp/package.json mcp/package-lock.json mcp/tsconfig.json mcp/vitest.config.ts mcp/.env.example
git commit -m "scaffold: initialize project with mcp package config"
```

---

### Task 2: Config Module (TDD)

**Files:**
- Create: `mcp/src/config.ts`
- Test: `mcp/src/config.test.ts`

**Step 1: Write the failing test**

```typescript
// mcp/src/config.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns config when both env vars are set', async () => {
    process.env.MEMOS_API_URL = 'http://localhost:5230';
    process.env.MEMOS_TOKEN = 'test-token';
    const { loadConfig } = await import('./config.js');
    const config = loadConfig();
    expect(config.apiUrl).toBe('http://localhost:5230');
    expect(config.token).toBe('test-token');
  });

  it('strips trailing slash from API URL', async () => {
    process.env.MEMOS_API_URL = 'http://localhost:5230/';
    process.env.MEMOS_TOKEN = 'test-token';
    const { loadConfig } = await import('./config.js');
    const config = loadConfig();
    expect(config.apiUrl).toBe('http://localhost:5230');
  });

  it('throws when MEMOS_API_URL is missing', async () => {
    delete process.env.MEMOS_API_URL;
    process.env.MEMOS_TOKEN = 'test-token';
    const { loadConfig } = await import('./config.js');
    expect(() => loadConfig()).toThrow('MEMOS_API_URL is required');
  });

  it('throws when MEMOS_TOKEN is missing', async () => {
    process.env.MEMOS_API_URL = 'http://localhost:5230';
    delete process.env.MEMOS_TOKEN;
    const { loadConfig } = await import('./config.js');
    expect(() => loadConfig()).toThrow('MEMOS_TOKEN is required');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/config.test.ts`
Expected: FAIL — cannot find `./config.js`

**Step 3: Write minimal implementation**

```typescript
// mcp/src/config.ts
import 'dotenv/config';

export interface MemosConfig {
  apiUrl: string;
  token: string;
}

export function loadConfig(): MemosConfig {
  const apiUrl = process.env.MEMOS_API_URL;
  const token = process.env.MEMOS_TOKEN;

  if (!apiUrl) {
    throw new Error(
      'MEMOS_API_URL is required. Set it as an environment variable or in .env'
    );
  }
  if (!token) {
    throw new Error(
      'MEMOS_TOKEN is required. Set it as an environment variable or in .env'
    );
  }

  return { apiUrl: apiUrl.replace(/\/$/, ''), token };
}
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/config.test.ts`
Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add mcp/src/config.ts mcp/src/config.test.ts
git commit -m "feat: add config module with env validation and .env fallback"
```

---

### Task 3: HTTP Client (TDD)

**Files:**
- Create: `mcp/src/client.ts`
- Test: `mcp/src/client.test.ts`

**Step 1: Write the failing test**

```typescript
// mcp/src/client.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('memosRequest', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env = { ...originalEnv };
    process.env.MEMOS_API_URL = 'http://localhost:5230';
    process.env.MEMOS_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sends GET request with auth header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: 'memos/1' }),
    });

    const { memosRequest } = await import('./client.js');
    const result = await memosRequest('/api/v1/memos/1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5230/api/v1/memos/1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual({ name: 'memos/1' });
  });

  it('sends POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: 'memos/2', content: 'hello' }),
    });

    const { memosRequest } = await import('./client.js');
    const result = await memosRequest('/api/v1/memos', {
      method: 'POST',
      body: JSON.stringify({ content: 'hello' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5230/api/v1/memos',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual({ name: 'memos/2', content: 'hello' });
  });

  it('throws on non-OK response with error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'unauthorized' }),
    });

    const { memosRequest } = await import('./client.js');
    await expect(memosRequest('/api/v1/memos')).rejects.toThrow(
      'Memos API error (401): unauthorized'
    );
  });

  it('returns empty object for 204 No Content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { memosRequest } = await import('./client.js');
    const result = await memosRequest('/api/v1/memos/1', { method: 'DELETE' });
    expect(result).toEqual({});
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/client.test.ts`
Expected: FAIL — cannot find `./client.js`

**Step 3: Write minimal implementation**

```typescript
// mcp/src/client.ts
import { loadConfig, type MemosConfig } from './config.js';

let _config: MemosConfig | null = null;

function getConfig(): MemosConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

export async function memosRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getConfig();
  const url = `${config.apiUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let message: string;
    try {
      const json = JSON.parse(body);
      message = json.message || json.error || body;
    } catch {
      message = body;
    }
    throw new Error(`Memos API error (${res.status}): ${message}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/client.test.ts`
Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add mcp/src/client.ts mcp/src/client.test.ts
git commit -m "feat: add HTTP client with auth, error handling, and 204 support"
```

---

### Task 4: Shared Types

**Files:**
- Create: `mcp/src/types.ts`

**Step 1: Create shared types file**

```typescript
// mcp/src/types.ts
export type Visibility = 'PRIVATE' | 'PROTECTED' | 'PUBLIC';
export type State = 'NORMAL' | 'ARCHIVED';

export interface Memo {
  name: string;
  state: State;
  creator: string;
  createTime: string;
  updateTime: string;
  displayTime: string;
  content: string;
  visibility: Visibility;
  tags: string[];
  pinned: boolean;
  snippet: string;
  property: {
    hasLink: boolean;
    hasTaskList: boolean;
    hasCode: boolean;
    hasIncompleteTasks: boolean;
  };
}

export interface MemoList {
  memos: Memo[];
  nextPageToken: string;
}
```

**Step 2: Commit**

```bash
git add mcp/src/types.ts
git commit -m "feat: add shared Memo types"
```

---

### Task 5: `memos_create` Tool (TDD)

**Files:**
- Create: `mcp/src/tools/create-memo.ts`
- Test: `mcp/src/tools/create-memo.test.ts`

**Step 1: Write the failing test**

```typescript
// mcp/src/tools/create-memo.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/tools/create-memo.test.ts`
Expected: FAIL — cannot find `./create-memo.js`

**Step 3: Write minimal implementation**

```typescript
// mcp/src/tools/create-memo.ts
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
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/tools/create-memo.test.ts`
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add mcp/src/tools/create-memo.ts mcp/src/tools/create-memo.test.ts
git commit -m "feat: add memos_create tool"
```

---

### Task 6: `memos_list` Tool (TDD)

**Files:**
- Create: `mcp/src/tools/list-memos.ts`
- Test: `mcp/src/tools/list-memos.test.ts`

**Step 1: Write the failing test**

```typescript
// mcp/src/tools/list-memos.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/tools/list-memos.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// mcp/src/tools/list-memos.ts
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
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/tools/list-memos.test.ts`
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add mcp/src/tools/list-memos.ts mcp/src/tools/list-memos.test.ts
git commit -m "feat: add memos_list tool with pagination and filtering"
```

---

### Task 7: `memos_get` Tool (TDD)

**Files:**
- Create: `mcp/src/tools/get-memo.ts`
- Test: `mcp/src/tools/get-memo.test.ts`

**Step 1: Write the failing test**

```typescript
// mcp/src/tools/get-memo.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../client.js', () => ({
  memosRequest: vi.fn(),
}));

import { memosRequest } from '../client.js';
import { getMemo } from './get-memo.js';

const mockRequest = vi.mocked(memosRequest);

describe('getMemo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('gets a memo by id', async () => {
    mockRequest.mockResolvedValueOnce({
      name: 'memos/abc',
      content: 'test',
    });

    const result = await getMemo({ id: 'abc' });

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/memos/abc');
    expect(result.name).toBe('memos/abc');
  });

  it('throws on empty id', async () => {
    await expect(getMemo({ id: '' })).rejects.toThrow('id must not be empty');
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/tools/get-memo.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// mcp/src/tools/get-memo.ts
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
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/tools/get-memo.test.ts`
Expected: 2 tests PASS

**Step 5: Commit**

```bash
git add mcp/src/tools/get-memo.ts mcp/src/tools/get-memo.test.ts
git commit -m "feat: add memos_get tool"
```

---

### Task 8: `memos_update` Tool (TDD)

**Files:**
- Create: `mcp/src/tools/update-memo.ts`
- Test: `mcp/src/tools/update-memo.test.ts`

**Step 1: Write the failing test**

```typescript
// mcp/src/tools/update-memo.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/tools/update-memo.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// mcp/src/tools/update-memo.ts
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
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/tools/update-memo.test.ts`
Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add mcp/src/tools/update-memo.ts mcp/src/tools/update-memo.test.ts
git commit -m "feat: add memos_update tool with updateMask support"
```

---

### Task 9: `memos_delete` Tool (TDD)

**Files:**
- Create: `mcp/src/tools/delete-memo.ts`
- Test: `mcp/src/tools/delete-memo.test.ts`

**Step 1: Write the failing test**

```typescript
// mcp/src/tools/delete-memo.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/tools/delete-memo.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// mcp/src/tools/delete-memo.ts
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
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/tools/delete-memo.test.ts`
Expected: 2 tests PASS

**Step 5: Commit**

```bash
git add mcp/src/tools/delete-memo.ts mcp/src/tools/delete-memo.test.ts
git commit -m "feat: add memos_delete tool"
```

---

### Task 10: Tool Registry + MCP Server Entry

**Files:**
- Create: `mcp/src/tools/index.ts`
- Create: `mcp/src/index.ts`
- Test: `mcp/src/tools/index.test.ts`

**Step 1: Write the failing test for tool registry**

```typescript
// mcp/src/tools/index.test.ts
import { describe, it, expect } from 'vitest';
import { toolDefinitions, dispatchTool } from './index.js';

describe('toolDefinitions', () => {
  it('defines 5 tools', () => {
    expect(toolDefinitions).toHaveLength(5);
  });

  it('all tools have memos_ prefix', () => {
    for (const tool of toolDefinitions) {
      expect(tool.name).toMatch(/^memos_/);
    }
  });

  it('all tools have name, description, and inputSchema', () => {
    for (const tool of toolDefinitions) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeTruthy();
    }
  });
});

describe('dispatchTool', () => {
  it('throws on unknown tool name', async () => {
    await expect(dispatchTool('unknown', {})).rejects.toThrow(
      'Unknown tool: unknown'
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd mcp && npx vitest run src/tools/index.test.ts`
Expected: FAIL

**Step 3: Write tool registry**

```typescript
// mcp/src/tools/index.ts
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
```

**Step 4: Run test to verify it passes**

Run: `cd mcp && npx vitest run src/tools/index.test.ts`
Expected: 4 tests PASS

**Step 5: Write MCP server entry**

```typescript
// mcp/src/index.ts
#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { toolDefinitions, dispatchTool } from './tools/index.js';

const server = new McpServer({
  name: 'openclaw-memos-mcp',
  version: '0.1.0',
});

for (const tool of toolDefinitions) {
  server.tool(
    tool.name,
    tool.description,
    tool.inputSchema.shape,
    async (args: Record<string, unknown>) => {
      const result = await dispatchTool(tool.name, args);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Step 6: Run all tests**

Run: `cd mcp && npx vitest run`
Expected: All tests PASS

**Step 7: Type-check**

Run: `cd mcp && npx tsc --noEmit`
Expected: No errors

**Step 8: Commit**

```bash
git add mcp/src/tools/index.ts mcp/src/tools/index.test.ts mcp/src/index.ts
git commit -m "feat: add tool registry and MCP server entry"
```

---

### Task 11: SKILL.md

**Files:**
- Create: `skill/SKILL.md`

**Step 1: Write the skill definition**

```markdown
---
name: memos
description: >
  Create, read, update, and delete memos on a Memos instance (usememos/memos).
  Handles requests like "save this as a memo", "list my recent memos",
  "update memo #123", or "delete memo #456".
  Uses openclaw-memos-mcp for all operations.
---

# Memos

## What it does

Provides full CRUD operations on a self-hosted Memos instance through 5 MCP
tools. Agents can create quick notes, search existing memos, update content
or visibility, and delete memos they no longer need.

## Inputs needed

- For creating: content (required), visibility (optional, defaults to PRIVATE)
- For listing: filter expression (optional), page size (optional)
- For get/update/delete: memo ID (required)

## Prerequisites

### `openclaw-memos-mcp` MCP server

Add to your MCP configuration:

\`\`\`json
{
  "mcpServers": {
    "memos-mcp": {
      "command": "npx",
      "args": ["openclaw-memos-mcp"],
      "env": {
        "MEMOS_API_URL": "http://localhost:5230",
        "MEMOS_TOKEN": "<your-access-token>"
      }
    }
  }
}
\`\`\`

Get your access token from Memos: Settings → Access Tokens → Create.

## Workflow

### Creating a memo

Call `memos_create` with the content and optional visibility.

- `content`: Markdown text. Supports `#hashtags` which Memos auto-extracts as tags.
- `visibility`: `PRIVATE` (default), `PROTECTED` (logged-in users), or `PUBLIC` (everyone).

### Listing memos

Call `memos_list` to browse or search memos.

- `pageSize`: Number of results (default 20).
- `pageToken`: For pagination, use the `nextPageToken` from a previous response.
- `filter`: CEL filter expression. Examples:
  - `tag == "work"` — memos tagged #work
  - `visibility == "PUBLIC"` — public memos only
  - `creator == "users/1"` — memos by a specific user

### Reading a specific memo

Call `memos_get` with the memo ID. The ID is the part after `memos/` in the
resource name (e.g., if the name is `memos/abc123`, the ID is `abc123`).

### Updating a memo

Call `memos_update` with the memo ID and the fields to change. Only specify
fields you want to update — unspecified fields remain unchanged.

- `content`: New Markdown content
- `visibility`: New visibility level
- `pinned`: `true` to pin, `false` to unpin

### Deleting a memo

Call `memos_delete` with the memo ID. **This is irreversible.** Always confirm
with the user before deleting.

## Guardrails

- Default visibility to `PRIVATE` — never create public memos unless explicitly asked
- Validate content is non-empty before creating
- Confirm with the user before deleting any memo
- On 401/403 errors, tell the user to check their `MEMOS_TOKEN`
- On connection errors, tell the user to check their `MEMOS_API_URL`
- When listing returns empty results, suggest the user check their filter or confirm the Memos instance has data
```

**Step 2: Commit**

```bash
git add skill/SKILL.md
git commit -m "feat: add OpenClaw skill definition for ClawHub"
```

---

### Task 12: README.md + CLAUDE.md

**Files:**
- Create: `README.md`
- Create: `CLAUDE.md`

**Step 1: Write README.md**

Cover: what this is, quick install for MCP server, quick install for skill, environment variables, tool reference table, development setup, license.

Key sections:
- Title + badges (npm, license)
- Quick Start (3 steps: install, configure env, add to MCP config)
- Tool Reference (table of 5 tools)
- Configuration (env vars + .env)
- Development (clone, install, test, build)
- License (MIT)

**Step 2: Write CLAUDE.md**

Follow the same pattern as `openclaw-skill-rsshub/CLAUDE.md`:
- What This Is
- Architecture (`skill/` + `mcp/`)
- Key Files
- Prerequisites
- Conventions (tool naming, testing, env handling)
- How to Test
- Common Tasks

**Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: add README and CLAUDE.md"
```

---

### Task 13: CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Write CI config**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    defaults:
      run:
        working-directory: mcp
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
          cache-dependency-path: mcp/package-lock.json
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm test
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint and test"
```

---

### Task 14: Final Verification

**Step 1: Run full test suite**

Run: `cd mcp && npx vitest run`
Expected: All tests PASS (should be ~18 tests total)

**Step 2: Type-check**

Run: `cd mcp && npx tsc --noEmit`
Expected: No errors

**Step 3: Build**

Run: `cd mcp && npm run build`
Expected: `dist/` directory created with compiled JS

**Step 4: Verify git status is clean**

Run: `git status`
Expected: Clean working tree, all files committed

**Step 5: Tag release**

```bash
git tag -a v0.1.0 -m "Initial release: 5 CRUD tools for Memos"
```

---

## Integration Testing (Manual)

After all tasks are complete, test against a real Memos instance:

1. Start Memos locally: `docker run -d -p 5230:5230 neosmemo/memos:stable`
2. Create an access token in the Memos UI
3. Set env vars and run: `MEMOS_API_URL=http://localhost:5230 MEMOS_TOKEN=<token> npx tsx mcp/src/index.ts`
4. Test with an MCP client or directly via stdio

**NOTE:** The request body format for `memos_create` may need adjustment. The Memos gRPC-gateway may expect the body to be either the memo object directly OR wrapped in a `"memo"` key. If the direct format returns errors, wrap the body: `{ "memo": { "content": "...", ... } }`. Verify during integration testing and adjust `create-memo.ts` and `update-memo.ts` accordingly.
