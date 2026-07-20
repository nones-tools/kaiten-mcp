#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { KaitenApiError, loadConfig, type KaitenConfig } from '../kaiten/index.js';
import { KaitenSDK } from '../sdk.js';
import { tools } from './tools/index.js';

const SERVER_NAME = 'kaiten-mcp';
const SERVER_VERSION = '3.0.0';

const LOG_LEVELS: Record<KaitenConfig['logLevel'], number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Config load failure (e.g. missing credentials) must not crash startup - the
// server still needs to answer `tools/list` without credentials configured.
// Fall back to 'info' in that case, matching the old server's behavior.
let logLevel: KaitenConfig['logLevel'] = 'info';
try {
  const config = loadConfig();
  if (config.logLevel) {
    logLevel = config.logLevel;
  }
} catch {
  // Use default log level
}

function shouldLog(level: keyof typeof LOG_LEVELS): boolean {
  return LOG_LEVELS[level] <= LOG_LEVELS[logLevel];
}

// All diagnostic logging goes to stderr only - stdout is the MCP protocol
// channel over stdio and must never carry anything but JSON-RPC messages.
function log(level: keyof typeof LOG_LEVELS, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;
  const timestamp = new Date().toISOString();
  const msg = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (data !== undefined) {
    console.error(msg, typeof data === 'string' ? data : JSON.stringify(data));
  } else {
    console.error(msg);
  }
}

function errorLog(message: string, data?: unknown): void {
  log('error', message, data);
}

function debugLog(message: string, data?: unknown): void {
  log('debug', message, data);
}

console.error(`MCP Server starting with log level: ${logLevel}`);

// The SDK is instantiated lazily on first tool call so that `tools/list`
// works even when Kaiten credentials are not configured yet.
let sdk: KaitenSDK | null = null;
function getSdk(): KaitenSDK {
  if (!sdk) {
    sdk = new KaitenSDK();
  }
  return sdk;
}

const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

for (const tool of tools) {
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    async (args: any) => {
      debugLog(`Tool called: ${tool.name}`, args);
      try {
        const result = await tool.handler(getSdk(), args ?? {});
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        let text = `Tool ${tool.name} failed: ${message}`;
        if (error instanceof KaitenApiError) {
          text += ` (HTTP ${error.status}) - ${JSON.stringify(error.body)}`;
          errorLog('Tool error:', { toolName: tool.name, message, httpStatus: error.status, responseData: error.body });
        } else {
          errorLog('Tool error:', { toolName: tool.name, message });
        }
        return {
          isError: true,
          content: [{ type: 'text' as const, text }],
        };
      }
    }
  );
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  errorLog('Fatal error starting MCP server', { message: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
