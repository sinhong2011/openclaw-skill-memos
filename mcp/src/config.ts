import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface MemosConfig {
  apiUrl: string;
  token: string;
}

let _dotenvLoaded = false;

function ensureDotenv(): void {
  if (_dotenvLoaded) return;
  _dotenvLoaded = true;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  // Load .env from mcp/ directory first, then project root as fallback
  // dotenv won't override existing env vars, so first match wins
  config({ path: resolve(__dirname, '..', '.env') });
  config({ path: resolve(__dirname, '..', '..', '.env') });
}

export function loadConfig(): MemosConfig {
  ensureDotenv();

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
