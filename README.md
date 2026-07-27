# @nones/kaiten-mcp

MCP (Model Context Protocol) server for Kaiten — lets Claude Code,
Claude Desktop, Cursor and other MCP clients manage your Kaiten boards: cards, child
cards, comments, tags, checklists, files and card-scoped git branches. Ships as a single
`kaiten` binary: `kaiten mcp` starts the MCP server, every other command is a regular
CLI; a typed SDK is exported for programmatic use.

> **Migrating from v3?** The separate `kaiten-mcp` binary was removed in v4.0.0 — append
> `mcp` to the command in your MCP config: prefer the project-local binary `kaiten mcp`; `npx -y @nones/kaiten-mcp mcp` remains supported.

## MCP clients (project-local install)

Install once in the project that owns the integration:

```sh
npm install -D @nones/kaiten-mcp
```

Use the local executable and set `cwd` explicitly so file-based configuration is deterministic:

```json
{
  "mcpServers": {
    "kaiten": {
      "command": "./node_modules/.bin/kaiten",
      "args": ["mcp"],
      "cwd": "/absolute/path/to/project",
      "env": { "KAITEN_CONFIG_FILE": "/absolute/path/to/kaiten.env" }
    }
  }
}
```

The same entry shape works in Codex Desktop, Claude Code/Claude Desktop and Cursor; place it in that client's MCP configuration file. You may instead use `npx -y @nones/kaiten-mcp mcp` as `command`/`args` where a local dependency is not desired.

Run `kaiten_health` after connecting to verify only safe metadata (sources, readiness and normalized API origin).

## Secret safety

Tokens and config-file contents are never returned by `kaiten_health`, MCP errors, or diagnostics. Prefer an MCP client `env` block or a permissions-restricted `KAITEN_CONFIG_FILE`; do not put tokens in URLs.

## Setup

You need two values:

| Variable | Where to get it |
| --- | --- |
| `KAITEN_API_URL` | `https://<kaiten_url>/api/latest` |
| `KAITEN_API_TOKEN` | Kaiten → Profile settings → API tokens → Create token |

**Claude Code:**

```bash
claude mcp add kaiten \
  -e KAITEN_API_URL=https://<kaiten_url>/api/latest \
  -e KAITEN_API_TOKEN=your_token \
  -- npx -y @nones/kaiten-mcp mcp
```

**Claude Desktop / Cursor / other clients** — add to the MCP config
(`claude_desktop_config.json`, `.cursor/mcp.json`, …):

```json
{
  "mcpServers": {
    "kaiten": {
      "command": "npx",
      "args": ["-y", "@nones/kaiten-mcp", "mcp"],
      "env": {
        "KAITEN_API_URL": "https://<kaiten_url>/api/latest",
        "KAITEN_API_TOKEN": "your_token"
      }
    }
  }
}
```

**Manual connection (token from a local `.env`)** — if you keep `KAITEN_API_TOKEN` in the
project's `.env` and don't want it duplicated in the MCP config, wrap the server in a small
shell command that reads the token at startup:

```json
{
  "mcpServers": {
    "kaiten": {
      "transport": "stdio",
      "command": "sh",
      "args": [
        "-c",
        "token=\"$(sed -n 's/^KAITEN_API_TOKEN=//p' .env 2>/dev/null | head -n 1)\"; [ -n \"$token\" ] && export KAITEN_API_TOKEN=\"$token\"; exec npx -y @nones/kaiten-mcp mcp"
      ],
      "env": {
        "KAITEN_API_URL": "https://<kaiten_url>/api/latest"
      }
    }
  }
}
```

That's it — ask your assistant to list your Kaiten spaces to verify the connection.

> **Note for AI agents:** if kaiten tools fail with a *"Missing required Kaiten
> configuration"* error, the server is installed but not configured. Show the error to
> the user — it explains exactly which variables (`KAITEN_API_URL`, `KAITEN_API_TOKEN`)
> to set and where.

## Destructive operations

Every tool backed by an HTTP DELETE to the Kaiten API — `kaiten_delete_card`,
`kaiten_delete_checklist`, `kaiten_delete_checklist_item`, `kaiten_delete_comment`,
`kaiten_remove_tag`, `kaiten_detach_from_parent`, `kaiten_unblock_card`,
`kaiten_remove_external_link` — is **disabled by default**. Calling one returns an actionable
error instead of deleting anything.

Deleting Kaiten entities is irreversible. To enable DELETE tools, a human must add
`KAITEN_API_DELETE_ALLOW=true` to the server's environment on purpose — for example in the
`env` block of the MCP config:

```json
{
  "mcpServers": {
    "kaiten": {
      "command": "npx",
      "args": ["-y", "@nones/kaiten-mcp", "mcp"],
      "env": {
        "KAITEN_API_URL": "https://<kaiten_url>/api/latest",
        "KAITEN_API_TOKEN": "your_token",
        "KAITEN_API_DELETE_ALLOW": "true"
      }
    }
  }
}
```

Or in `~/.kaiten/config` / `./.kaiten.env` / `./.env` (see [Configuration](docs/configuration.md)).

> **Note for AI agents:** if a DELETE tool fails with a *"DELETE operations are disabled for
> safety"* error, do not set `KAITEN_API_DELETE_ALLOW` yourself — relay the error to the user
> verbatim and let them decide whether to enable it.

## Agent guardrails (v3.3.0+)

Optional environment variables that confine what an AI agent can see and do through this
server. All are **off by default** — with none set, behavior is unchanged. Configured
guardrails compose as an intersection: an operation must pass every check.

| Variable | Effect |
| --- | --- |
| `KAITEN_READ_ONLY` | `true` blocks every create/update/delete at the HTTP layer — the agent can only read |
| `KAITEN_ALLOWED_SPACE_IDS` / `KAITEN_ALLOWED_BOARD_IDS` | allowlists: listings are filtered, operations outside are rejected |
| `KAITEN_ALLOWED_COLUMN_IDS` / `KAITEN_ALLOWED_LANE_IDS` | same, per column / lane |
| `KAITEN_PROTECTED_COLUMN_IDS` | agent cannot move/create cards **into** these columns (e.g. Done/Deploy), reading is allowed |
| `KAITEN_ENFORCE_SCOPE` | `true` turns `KAITEN_DEFAULT_SPACE_ID`/`KAITEN_DEFAULT_BOARD_ID` into hard boundaries — one-variable "single board" confinement |
| `KAITEN_DISABLED_TOOLS` | comma-separated tool names to hide from the agent entirely |
| `KAITEN_CARDS_LIMIT` | cap card-list responses at N cards (truncation is reported explicitly) |
| `KAITEN_MINIMAL_DEFAULT` | `true` makes card listings token-minimal by default |
| `KAITEN_DEFAULT_COLUMN_ID` / `KAITEN_DEFAULT_LANE_ID` | where `kaiten_create_card` puts cards when the agent omits column/lane |
| `KAITEN_HTTP_TIMEOUT_MS` / `KAITEN_HTTP_RETRIES` | per-request timeout; retries for reads on transient failures |

Example — a read-only agent locked to one board:

```json
"env": {
  "KAITEN_API_URL": "https://<kaiten_url>/api/latest",
  "KAITEN_API_TOKEN": "your_token",
  "KAITEN_DEFAULT_SPACE_ID": "12345",
  "KAITEN_DEFAULT_BOARD_ID": "67890",
  "KAITEN_ENFORCE_SCOPE": "true",
  "KAITEN_READ_ONLY": "true"
}
```

Guardrails constrain the agent using this server — they are **not** a substitute for the
API token's own permissions. Full semantics, composition rules and enforcement tiers:
[Configuration → Guardrails](docs/configuration.md).

> **Note for AI agents:** never set, change or remove guardrail variables yourself. If an
> operation fails with an error naming one of these variables, relay the error to the user
> verbatim and let them decide.

## Documentation

- [Configuration](docs/configuration.md) — all variables, config files, precedence, allowlists
- [MCP tools](docs/tools.md) — all 58 tools and their token-saving flags
- [CLI](docs/cli.md) — the `kaiten` command reference
- [SDK](docs/sdk.md) — programmatic usage from Node/Bun
- [Architecture](docs/architecture.md) — layers, Kaiten Core, design decisions
- [Development](docs/development.md) — building, testing, releasing

## Requirements

Node.js >= 18. No other runtime dependencies beyond the MCP SDK.

## License

MIT
