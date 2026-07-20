#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { ToolContext } from '../interfaces/hook.js';
import { KaitenSDK } from '../sdk.js';
import { compose, errorHook, loggingHook } from './hooks/index.js';
import { errorLog, logLevel } from './logger.js';
import { tools } from './tools/index.js';

const SERVER_NAME = 'kaiten-mcp';
const SERVER_VERSION = '3.0.0';

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

// Every tool call runs through the middleware chain: logging wraps error
// formatting wraps the terminal handler (chain of responsibility).
for (const tool of tools) {
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
