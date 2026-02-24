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
