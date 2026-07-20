import type { ToolHook } from '../../interfaces/hook.js';
import { debugLog } from '../logger.js';

/** Outermost hook: debug-logs every tool invocation to stderr (honors KAITEN_LOG_LEVEL). */
export const loggingHook: ToolHook = async (ctx, next) => {
  debugLog(`Tool called: ${ctx.toolName}`, ctx.args);
  await next();
};
