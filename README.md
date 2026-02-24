# openclaw-skill-memos

[![npm version](https://img.shields.io/npm/v/openclaw-memos-mcp)](https://www.npmjs.com/package/openclaw-memos-mcp)
[![CI](https://github.com/sinhong2011/openclaw-skill-memos/actions/workflows/ci.yml/badge.svg)](https://github.com/sinhong2011/openclaw-skill-memos/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Let your AI agent read and write to your [Memos](https://github.com/usememos/memos) instance. This project provides:

- **MCP Server** (`openclaw-memos-mcp`) — connects any MCP-compatible client to your Memos API
- **OpenClaw Skill** (`skill/SKILL.md`) — teaches agents how to use the tools effectively

## Quick Start

### Prerequisites

- A running [Memos](https://github.com/usememos/memos) instance (self-hosted or cloud)
- An access token from your Memos instance (**Settings > Access Tokens > Create**)
- Node.js 18+

### For OpenClaw Users

Install the skill from ClawHub:

```bash
clawhub install usememos
```

Then add the MCP server to your OpenClaw configuration (see below).

### For Any MCP Client (Claude Desktop, Cursor, etc.)

Add this to your MCP configuration file:

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

> **Where is my MCP config file?**
>
> | Client | Location |
> |--------|----------|
> | Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) |
> | OpenClaw | `~/.openclaw/openclaw.json` or project `.mcp.json` |
> | Cursor | `.cursor/mcp.json` in your project |

That's it — your agent can now create, read, update, and delete memos.

## What Can It Do?

| Tool | What it does | Example prompt |
|------|-------------|----------------|
| `memos_create` | Create a new memo | *"Save this meeting summary as a memo"* |
| `memos_list` | Search and browse memos | *"Show me my memos tagged #work"* |
| `memos_get` | Read a specific memo | *"Read memo 42"* |
| `memos_update` | Edit content, visibility, or pin status | *"Make memo 42 public"* |
| `memos_delete` | Remove a memo | *"Delete memo 42"* |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `MEMOS_API_URL` | Yes | Base URL of your Memos instance (e.g., `http://localhost:5230`) |
| `MEMOS_TOKEN` | Yes | Access token from Memos Settings |

You can also set these in a `.env` file alongside the MCP server.

## Development

```bash
cd mcp
npm install
npm test          # Run tests
npm run build     # Compile TypeScript
npm run dev       # Run with tsx (dev mode)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new tools, commit conventions, and pull request workflow.

## License

MIT
