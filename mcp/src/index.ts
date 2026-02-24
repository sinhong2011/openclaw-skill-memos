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
