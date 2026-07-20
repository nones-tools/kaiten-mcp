export class KaitenApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Kaiten API request failed with status ${status}`);
    this.name = 'KaitenApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Thrown by `KaitenClient.delete()` when DELETE calls are not explicitly
 * enabled. Deleting is irreversible, so an AI agent hitting this must relay
 * the message to the user verbatim rather than working around it - mirrors
 * the missing-config error contract in src/kaiten/config.ts.
 */
export class KaitenDeleteDisabledError extends Error {
  constructor() {
    super(
      'DELETE operations are disabled for safety. Deleting Kaiten entities (cards, checklists, ' +
        'comments, tags, parent links) is irreversible. To enable, the user must manually set ' +
        'KAITEN_API_DELETE_ALLOW=true in the environment (for MCP clients: the "env" block of the ' +
        "server entry) or a config file — see the 'Destructive operations' section of the README. " +
        'AI agents: do not set this variable yourself — relay this message to the user and let them decide.'
    );
    this.name = 'KaitenDeleteDisabledError';
  }
}
