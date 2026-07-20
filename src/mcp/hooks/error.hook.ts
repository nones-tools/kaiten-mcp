import type { ToolHook } from '../../interfaces/hook.js';
import { KaitenApiError } from '../../kaiten/http/errors.js';
import { errorLog } from '../logger.js';

/**
 * Catches failures from the handler and formats them into the exact error
 * contract of the pre-refactor server: `Tool <name> failed: <message>`,
 * with an ` (HTTP <status>) - <body>` suffix for KaitenApiError. Plain
 * Error messages (e.g. the actionable missing-config guidance from
 * loadConfig) pass through verbatim inside <message>.
 */
export const errorHook: ToolHook = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    let text = `Tool ${ctx.toolName} failed: ${message}`;
    if (error instanceof KaitenApiError) {
      text += ` (HTTP ${error.status}) - ${JSON.stringify(error.body)}`;
      errorLog('Tool error:', { toolName: ctx.toolName, message, httpStatus: error.status, responseData: error.body });
    } else {
      errorLog('Tool error:', { toolName: ctx.toolName, message });
    }
    ctx.response = {
      isError: true,
      content: [{ type: 'text', text }],
    };
  }
};
