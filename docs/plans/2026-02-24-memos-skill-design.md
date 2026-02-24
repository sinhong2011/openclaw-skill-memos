# Design: OpenClaw Memos Skill + MCP Server

**Date:** 2026-02-24
**Repo:** `sinhong2011/openclaw-skill-memos`
**License:** MIT
**Publish targets:** npm (`openclaw-memos-mcp`) + ClawHub (skill)

## Overview

A standalone open-source project that provides:
1. An MCP server (`openclaw-memos-mcp`) for full CRUD operations on a Memos instance
2. An OpenClaw skill (`SKILL.md`) that teaches agents how to use the MCP tools

## Repository Structure

```
openclaw-skill-memos/
├── README.md
├── LICENSE                          # MIT
├── CLAUDE.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml                   # Lint, type-check, test
│
├── skill/                           # → Published to ClawHub
│   └── SKILL.md
│
├── mcp/                             # → Published to npm as openclaw-memos-mcp
│   ├── src/
│   │   ├── index.ts                 # MCP server entry, registers 5 tools
│   │   ├── client.ts                # Shared HTTP client (auth, base URL, error handling)
│   │   ├── config.ts                # Env loading + fail-fast validation
│   │   └── tools/
│   │       ├── create-memo.ts       # memos_create
│   │       ├── list-memos.ts        # memos_list
│   │       ├── get-memo.ts          # memos_get
│   │       ├── update-memo.ts       # memos_update
│   │       └── delete-memo.ts       # memos_delete
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── .env.example
│
└── docs/
    └── plans/
```

## Memos API v1 Reference

Source: `proto/api/v1/memo_service.proto` from usememos/memos.

### Authentication

Bearer token via `Authorization: Bearer <token>`. Tokens generated in Memos Settings > Access Tokens.

### Endpoints

| Tool | HTTP | Endpoint | Request Body |
|---|---|---|---|
| `memos_create` | POST | `/api/v1/memos` | `{ "memo": { "content", "visibility", "state" } }` |
| `memos_list` | GET | `/api/v1/memos` | Query: `pageSize`, `pageToken`, `filter` |
| `memos_get` | GET | `/api/v1/memos/{id}` | — |
| `memos_update` | PATCH | `/api/v1/memos/{id}` | `{ "memo": { "content", "visibility", "pinned" } }` |
| `memos_delete` | DELETE | `/api/v1/memos/{id}` | — |

### Visibility Values

- `PRIVATE` — Only visible to creator and admins
- `PROTECTED` — Visible to all authenticated users
- `PUBLIC` — Visible to everyone

### State Values

- `NORMAL` — Active memo (default for creation)
- `ARCHIVED` — Archived memo

## MCP Tool Definitions

### `memos_create`

Creates a new memo.

**Parameters:**
- `content` (string, required) — Memo body in Markdown
- `visibility` (enum, default `PRIVATE`) — `PRIVATE`, `PROTECTED`, or `PUBLIC`

Internally sets `state: "NORMAL"`. Returns the created memo object including `name` (resource ID), `createTime`, extracted `tags`.

### `memos_list`

Lists memos with optional filtering.

**Parameters:**
- `pageSize` (number, default 20) — Results per page
- `pageToken` (string, optional) — Pagination cursor
- `filter` (string, optional) — CEL filter expression (e.g., `visibility == "PUBLIC"`, `tag == "work"`)

Returns `{ memos: [...], nextPageToken: "..." }`.

### `memos_get`

Retrieves a single memo by ID.

**Parameters:**
- `id` (string, required) — Memo ID (the part after `memos/` in the resource name)

Returns the full memo object.

### `memos_update`

Updates an existing memo.

**Parameters:**
- `id` (string, required) — Memo ID
- `content` (string, optional) — New content
- `visibility` (enum, optional) — New visibility
- `pinned` (boolean, optional) — Pin/unpin

Uses PATCH with `updateMask` to only update specified fields.

### `memos_delete`

Deletes a memo.

**Parameters:**
- `id` (string, required) — Memo ID

Returns success/failure.

## Configuration Layer (`config.ts`)

1. Load `.env` file via `dotenv` if present in the MCP server directory
2. Read `MEMOS_API_URL` and `MEMOS_TOKEN` from `process.env`
3. Fail fast with descriptive error message if either is missing:
   ```
   Error: MEMOS_API_URL is required. Set it as an environment variable or in .env
   Error: MEMOS_TOKEN is required. Set it as an environment variable or in .env
   ```

## HTTP Client (`client.ts`)

Shared client used by all tools:
- Sets `Authorization: Bearer <token>` header on every request
- Prepends `MEMOS_API_URL` to all paths
- Parses error responses from Memos API into structured error objects
- Uses native `fetch` (Node 18+, no dependencies)

## SKILL.md

### Frontmatter

```yaml
name: memos
description: >
  Create, read, update, and delete memos on a Memos instance.
  Handles requests like "save this as a memo", "list my recent memos",
  or "delete memo #123". Uses openclaw-memos-mcp for all operations.
```

### Prerequisites

`openclaw-memos-mcp` MCP server. Install via:

```json
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
```

### Workflow

1. **Create a memo** — Call `memos_create` with content + visibility
2. **List/search memos** — Call `memos_list` with optional filters
3. **Read a specific memo** — Call `memos_get` with ID
4. **Update a memo** — Call `memos_update` with ID + changed fields
5. **Delete a memo** — Call `memos_delete` with ID (confirm with user first)

### Guardrails

- Validate content is non-empty before creating
- Confirm with user before deleting
- Handle 401/403 errors with clear "check your MEMOS_TOKEN" message
- Handle connection errors with "check your MEMOS_API_URL" message
- Default visibility to `PRIVATE` to avoid accidental exposure

## npm Package (`openclaw-memos-mcp`)

### package.json key fields

- `name`: `openclaw-memos-mcp`
- `bin`: `{ "openclaw-memos-mcp": "./dist/index.js" }`
- `files`: `["dist"]`
- `scripts.build`: `tsc`
- `scripts.test`: `vitest run`

### Dependencies

- `@modelcontextprotocol/sdk` — MCP server SDK
- `dotenv` — .env file loading

### Dev Dependencies

- `typescript`, `tsx` — Build + dev runner
- `vitest` — Testing

## CI (`ci.yml`)

- Triggers: push to `main`, pull requests
- Matrix: Node 20.x
- Steps: checkout, install, `tsc --noEmit`, `vitest run`

## Key Design Decisions

1. **Monorepo (`skill/` + `mcp/`)** — Single repo, two publishable artifacts
2. **`openclaw-memos-mcp`** npm name — Namespaced to avoid collision
3. **`memos_` prefix** on all tools — Follows OpenClaw convention
4. **Native `fetch`** — No axios/node-fetch dependency, Node 18+ required
5. **`vitest`** for testing — Matches existing OpenClaw MCP server conventions
6. **No build step for skill** — `SKILL.md` is pure markdown, published as-is to ClawHub
7. **CRUD naming** (`create/list/get/update/delete`) — Clearer than HTTP verbs for agent consumption
