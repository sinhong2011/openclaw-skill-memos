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
