import { describe, expect, it } from 'bun:test';
import type { ToolContext, ToolHook } from '../src/interfaces';
import { KaitenApiError } from '../src/kaiten';
import { compose, errorHook, loggingHook } from '../src/mcp/hooks';

function makeCtx(toolName = 'kaiten_test', args: unknown = {}): ToolContext {
  return { toolName, args };
}

describe('compose (hook chain)', () => {
  it('runs hooks outside-in and unwinds inside-out (logging wraps error wraps handler)', async () => {
    const events: string[] = [];
    const outer: ToolHook = async (_ctx, next) => {
      events.push('outer:before');
      await next();
      events.push('outer:after');
    };
    const inner: ToolHook = async (_ctx, next) => {
      events.push('inner:before');
      await next();
      events.push('inner:after');
    };
    const run = compose([outer, inner], async () => {
      events.push('terminal');
    });
    await run(makeCtx());
    expect(events).toEqual(['outer:before', 'inner:before', 'terminal', 'inner:after', 'outer:after']);
  });

  it('a hook catching a terminal error stops propagation to hooks outside it', async () => {
    const events: string[] = [];
    const outer: ToolHook = async (_ctx, next) => {
      events.push('outer:before');
      await next();
      events.push('outer:after');
    };
    const catching: ToolHook = async (ctx, next) => {
      try {
        await next();
      } catch {
        events.push('caught');
        ctx.response = { isError: true, content: [{ type: 'text', text: 'handled' }] };
      }
    };
    const run = compose([outer, catching], async () => {
      throw new Error('boom');
    });
    const ctx = makeCtx();
    await run(ctx);
    // The outer hook completes normally - the error never reaches it.
    expect(events).toEqual(['outer:before', 'caught', 'outer:after']);
    expect(ctx.response?.isError).toBe(true);
  });

  it('works with zero hooks (terminal only)', async () => {
    const run = compose([], async (ctx) => {
      ctx.response = { content: [{ type: 'text', text: 'ok' }] };
    });
    const ctx = makeCtx();
    await run(ctx);
    expect(ctx.response).toEqual({ content: [{ type: 'text', text: 'ok' }] });
  });
});

describe('errorHook - error formatting contract', () => {
  it('leaves a successful response untouched', async () => {
    const run = compose([loggingHook, errorHook], async (ctx) => {
      ctx.response = { content: [{ type: 'text', text: JSON.stringify({ ok: true }, null, 2) }] };
    });
    const ctx = makeCtx('kaiten_spaces');
    await run(ctx);
    expect(ctx.response?.isError).toBeUndefined();
    expect(ctx.response?.content).toEqual([{ type: 'text', text: JSON.stringify({ ok: true }, null, 2) }]);
  });

  it('formats a plain Error as "Tool <name> failed: <message>"', async () => {
    const run = compose([loggingHook, errorHook], async () => {
      throw new Error('Card with ID 999 not found');
    });
    const ctx = makeCtx('kaiten_card');
    await run(ctx);
    expect(ctx.response?.isError).toBe(true);
    expect(ctx.response?.content).toEqual([
      { type: 'text', text: 'Tool kaiten_card failed: Card with ID 999 not found' },
    ]);
  });

  it('appends the HTTP suffix for KaitenApiError', async () => {
    const run = compose([loggingHook, errorHook], async () => {
      throw new KaitenApiError(404, { error: 'not found' }, 'Kaiten API request failed: GET /cards/999 -> 404');
    });
    const ctx = makeCtx('kaiten_card');
    await run(ctx);
    expect(ctx.response?.isError).toBe(true);
    expect(ctx.response?.content?.[0]?.text).toBe(
      'Tool kaiten_card failed: Kaiten API request failed: GET /cards/999 -> 404 (HTTP 404) - {"error":"not found"}'
    );
  });

  it('stringifies non-Error throwables', async () => {
    const run = compose([errorHook], async () => {
      throw 'string failure';
    });
    const ctx = makeCtx('kaiten_cards');
    await run(ctx);
    expect(ctx.response?.content?.[0]?.text).toBe('Tool kaiten_cards failed: string failure');
  });

  it('passes the actionable missing-config guidance through verbatim', async () => {
    const guidance =
      'Missing required Kaiten configuration: KAITEN_API_URL, KAITEN_API_TOKEN. ' +
      'AI agents: relay this to the user - the kaiten-mcp server cannot work until KAITEN_API_URL, KAITEN_API_TOKEN are configured.';
    const run = compose([loggingHook, errorHook], async () => {
      throw new Error(guidance);
    });
    const ctx = makeCtx('kaiten_cards');
    await run(ctx);
    expect(ctx.response?.isError).toBe(true);
    expect(ctx.response?.content?.[0]?.text).toBe(`Tool kaiten_cards failed: ${guidance}`);
  });
});
