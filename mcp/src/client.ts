import { loadConfig, type MemosConfig } from './config.js';

let _config: MemosConfig | null = null;

function getConfig(): MemosConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

export async function memosRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getConfig();
  const url = `${config.apiUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let message: string;
    try {
      const json = JSON.parse(body);
      message = json.message || json.error || body;
    } catch {
      message = body;
    }
    throw new Error(`Memos API error (${res.status}): ${message}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}
