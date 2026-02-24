# openclaw-memos-mcp

[![npm version](https://img.shields.io/npm/v/openclaw-memos-mcp)](https://www.npmjs.com/package/openclaw-memos-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/sinhong2011/openclaw-skill-memos/blob/main/LICENSE)

An [MCP](https://modelcontextprotocol.io/) server that gives AI agents full CRUD access to your [Memos](https://github.com/usememos/memos) instance. Works with Claude Desktop, OpenClaw, Cursor, and any MCP-compatible client.

## Setup

### 1. Get your Memos access token

In your Memos instance: **Settings > Access Tokens > Create**.

### 2. Add to your MCP client

```json
{
  "mcpServers": {
    "memos": {
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

Replace `MEMOS_API_URL` with your Memos instance URL and `MEMOS_TOKEN` with the token from step 1.

> **Where does this config go?**
>
> | Client | Config file |
> |--------|-------------|
> | Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) |
> | OpenClaw | `~/.openclaw/openclaw.json` or project `.mcp.json` |
> | Cursor | `.cursor/mcp.json` in your project |

## Tools

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `memos_create` | Create a new memo | `content` (required), `visibility` (optional) |
| `memos_list` | List and filter memos | `filter`, `pageSize`, `pageToken` |
| `memos_get` | Get a memo by ID | `id` (required) |
| `memos_update` | Update a memo | `id` (required), `content`, `visibility`, `pinned` |
| `memos_delete` | Delete a memo | `id` (required) |

### Filter examples

The `memos_list` tool supports [CEL](https://github.com/google/cel-spec) filter expressions:

```
tag == "work"              # memos tagged #work
visibility == "PUBLIC"     # public memos only
creator == "users/1"       # memos by a specific user
```

### Visibility options

- `PRIVATE` (default) — only you can see it
- `PROTECTED` — visible to logged-in users
- `PUBLIC` — visible to everyone

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `MEMOS_API_URL` | Yes | Your Memos instance URL (e.g., `http://localhost:5230`) |
| `MEMOS_TOKEN` | Yes | Access token from Memos Settings |

## Requirements

- Node.js 18+
- A running Memos instance (v0.18+)

## Links

- [GitHub](https://github.com/sinhong2011/openclaw-skill-memos)
- [Memos](https://github.com/usememos/memos)
- [MCP Protocol](https://modelcontextprotocol.io/)

## License

MIT
