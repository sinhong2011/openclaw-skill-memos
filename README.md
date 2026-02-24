# openclaw-skill-memos

MCP server + OpenClaw skill for full CRUD operations on a [Memos](https://github.com/usememos/memos) instance.

## Quick Start

### 1. Add the MCP server to your configuration

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

### 2. Get your access token

In your Memos instance: **Settings > Access Tokens > Create**.

## Tool Reference

| Tool | Description |
|------|-------------|
| `memos_create` | Create a new memo (Markdown content, optional visibility) |
| `memos_list` | List memos with optional CEL filtering and pagination |
| `memos_get` | Get a single memo by ID |
| `memos_update` | Update memo content, visibility, or pinned status |
| `memos_delete` | Delete a memo by ID |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `MEMOS_API_URL` | Yes | Base URL of your Memos instance (e.g., `http://localhost:5230`) |
| `MEMOS_TOKEN` | Yes | Access token from Memos Settings |

You can also create a `.env` file in the MCP server directory.

## Development

```bash
cd mcp
npm install
npm test          # Run tests
npm run build     # Compile TypeScript
npm run dev       # Run with tsx (dev mode)
```

## OpenClaw Skill

The `skill/SKILL.md` file is an OpenClaw skill definition that teaches agents how to use the MCP tools. Install it via ClawHub or reference it directly.

## License

MIT
