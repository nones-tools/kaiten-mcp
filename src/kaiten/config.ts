import fs from 'fs';
import os from 'os';
import path from 'path';
import type { KaitenConfig } from './interfaces';

export type { KaitenConfig } from './interfaces';

/**
 * Parses `KEY=VALUE` lines, ignoring blank lines and `#` comments. Values may
 * contain `=` themselves (only the first `=` splits key from value).
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

function readEnvFile(filePath: string): Record<string, string> {
  try {
    return parseEnvFile(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function readProcessEnv(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('KAITEN_') && value !== undefined) result[key] = value;
  }
  return result;
}

function parseIntList(value: string | undefined): number[] | null {
  if (!value) return null;
  return value
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !Number.isNaN(id));
}

/**
 * Loads Kaiten configuration, merging (lowest to highest precedence):
 * `~/.kaiten/config` -> `<cwd>/.env` -> `<cwd>/.kaiten.env` -> `process.env`.
 * `overrides` wins over all sources (used by tests / explicit callers).
 * No caching: cheap to call repeatedly, always reflects current env/files.
 */
export function loadConfig(overrides: Partial<KaitenConfig> = {}): KaitenConfig {
  const homeConfig = readEnvFile(path.join(os.homedir(), '.kaiten', 'config'));
  const dotEnv = readEnvFile(path.join(process.cwd(), '.env'));
  const kaitenEnv = readEnvFile(path.join(process.cwd(), '.kaiten.env'));
  const processEnv = readProcessEnv();

  const merged = { ...homeConfig, ...dotEnv, ...kaitenEnv, ...processEnv };

  const config: KaitenConfig = {
    apiUrl: merged.KAITEN_API_URL ?? '',
    apiToken: merged.KAITEN_API_TOKEN ?? '',
    defaultSpaceId: merged.KAITEN_DEFAULT_SPACE_ID ? parseInt(merged.KAITEN_DEFAULT_SPACE_ID, 10) : null,
    defaultBoardId: merged.KAITEN_DEFAULT_BOARD_ID ? parseInt(merged.KAITEN_DEFAULT_BOARD_ID, 10) : null,
    allowedSpaceIds: parseIntList(merged.KAITEN_ALLOWED_SPACE_IDS),
    allowedBoardIds: parseIntList(merged.KAITEN_ALLOWED_BOARD_IDS),
    logLevel: (merged.KAITEN_LOG_LEVEL as KaitenConfig['logLevel']) || 'info',
    deleteAllow: (merged.KAITEN_API_DELETE_ALLOW ?? '').toLowerCase() === 'true',
    ...overrides,
  };

  if (!config.apiUrl || !config.apiToken) {
    const missing = [
      !config.apiUrl ? 'KAITEN_API_URL' : null,
      !config.apiToken ? 'KAITEN_API_TOKEN' : null,
    ]
      .filter((v): v is string => v !== null)
      .join(', ');
    throw new Error(
      `Missing required Kaiten configuration: ${missing}. ` +
        `Get an API token in Kaiten (Profile settings -> API tokens), then set the variables via ` +
        `environment (for MCP clients: the "env" block of the server entry in the MCP config), ` +
        `<cwd>/.kaiten.env, <cwd>/.env, or ~/.kaiten/config. ` +
        `AI agents: relay this to the user - the kaiten-mcp server cannot work until ${missing} ${missing.includes(',') ? 'are' : 'is'} configured.`
    );
  }

  return config;
}
