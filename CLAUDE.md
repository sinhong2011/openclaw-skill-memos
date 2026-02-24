# openclaw-skill-memos

## What This Is

A standalone open-source project providing:
1. An MCP server (`openclaw-memos-mcp`) for full CRUD on a Memos instance
2. An OpenClaw skill (`SKILL.md`) that teaches agents how to use the MCP tools

## Architecture

```
openclaw-skill-memos/
├── skill/SKILL.md          # OpenClaw skill → published to ClawHub
├── mcp/                    # MCP server → published to npm
│   ├── src/
│   │   ├── index.ts        # Server entry, registers 5 tools
│   │   ├── config.ts       # Env loading + fail-fast validation
│   │   ├── client.ts       # Shared HTTP client (auth, errors)
│   │   ├── types.ts        # Memo, MemoList, Visibility, State
│   │   └── tools/
│   │       ├── index.ts    # Tool registry + dispatcher
│   │       ├── create-memo.ts
│   │       ├── list-memos.ts
│   │       ├── get-memo.ts
│   │       ├── update-memo.ts
│   │       └── delete-memo.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
└── docs/plans/             # Design + implementation plans
```

## Key Files

- `mcp/src/config.ts` — Loads `MEMOS_API_URL` and `MEMOS_TOKEN` from env, fails fast if missing
- `mcp/src/client.ts` — `memosRequest()` adds auth headers, handles errors, supports 204
- `mcp/src/tools/index.ts` — Central registry with zod schemas, dispatches to tool functions
- `mcp/src/index.ts` — MCP server entry using `@modelcontextprotocol/sdk`

## Conventions

- All tool names use `memos_` prefix
- Tests use vitest with mocked `memosRequest`
- Each tool has a separate file + test file
- Native `fetch` (Node 18+), no axios/node-fetch
- `dotenv` for .env file support

## How to Test

```bash
cd mcp
npm test              # Run all tests
npx vitest run src/tools/create-memo.test.ts  # Run specific test
npx tsc --noEmit      # Type-check
```

## Common Tasks

- **Add a new tool:** Create `mcp/src/tools/<name>.ts` + test, add to `tools/index.ts` registry
- **Change API endpoint:** Update the relevant tool file's URL path
- **Update skill docs:** Edit `skill/SKILL.md`
