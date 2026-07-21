#!/usr/bin/env node

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { ToolContext } from '../interfaces';
import { loadConfigLenient } from '../kaiten';
import { KaitenSDK } from '../sdk';
import { compose, errorHook, loggingHook } from './hooks';
import { errorLog, logLevel } from './logger';
import { filterTools, tools } from './tools';

/**
 * Version comes from package.json at runtime (not a hardcoded literal) so
 * it can never drift from the published npm version. Read via `fs` rather
 * than a JSON import: this file runs both as TS source under `bun` (dev
 * mode, `src/mcp/server.ts`) and as bundled JS under plain Node (`dist/mcp/
 * server.js`) - a plain `import ... with { type: 'json' }` would tie
 * correctness to the target Node version's import-attribute support, while
 * `../../package.json` relative to this file resolves to the repo/package
 * root in both layouts (src/mcp/ and dist/mcp/ are the same depth).
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8')) as { version: string };

const SERVER_NAME = 'kaiten-mcp';
const SERVER_VERSION = pkg.version;

console.error(`MCP Server starting with log level: ${logLevel}`);

// The SDK is instantiated lazily on first tool call (inside the hook chain,
// so a missing-config error surfaces through the error hook) - `tools/list`
// must work even when Kaiten credentials are not configured yet.
let sdk: KaitenSDK | null = null;
function getSdk(): KaitenSDK {
  if (!sdk) {
    sdk = new KaitenSDK();
  }
  return sdk;
}

const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

// `loadConfigLenient()` never throws on missing credentials - `tools/list`
// must work before `KAITEN_API_URL`/`KAITEN_API_TOKEN` are configured, so
// this can't reuse the credential-requiring `loadConfig()` the SDK uses
// internally. Only `disabledTools` is read here (US5, specs/001-agent-guardrails).
const { disabledTools } = loadConfigLenient();
const { kept: registeredTools, unknown: unknownDisabledTools } = filterTools(tools, disabledTools);
if (unknownDisabledTools.length > 0) {
  console.error(
    `KAITEN_DISABLED_TOOLS names no known tool (ignored): ${unknownDisabledTools.join(', ')}`
  );
}

// Every tool call runs through the middleware chain: logging wraps error
// formatting wraps the terminal handler (chain of responsibility).
for (const tool of registeredTools) {
  const runTool = compose([loggingHook, errorHook], async (ctx) => {
    const result = await tool.handler(getSdk(), ctx.args ?? {});
    ctx.response = {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  });

  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
      ...(tool.annotations ? { annotations: tool.annotations } : {}),
    },
    async (args: any) => {
      const ctx: ToolContext = { toolName: tool.name, args };
      await runTool(ctx);
      return ctx.response!;
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
