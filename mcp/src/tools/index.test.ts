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
