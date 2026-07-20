import type { z } from 'zod';
import type { KaitenSDK } from '../sdk.js';

/**
 * A single MCP tool registration: name, description, zod input shape, and
 * the handler that maps validated args onto SDK calls.
 */
export interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodRawShape;
  handler: (sdk: KaitenSDK, args: any) => Promise<unknown>;
}
