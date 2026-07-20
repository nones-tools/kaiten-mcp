# @nones/kaiten-mcp

MCP (Model Context Protocol) server for Kaiten — lets Claude Code,
Claude Desktop, Cursor and other MCP clients manage your Kaiten boards: cards, child
cards, comments, tags, checklists, files and card-scoped git branches. Also ships a
`kaiten` CLI and a typed SDK.

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
  -- npx -y @nones/kaiten-mcp
```

**Claude Desktop / Cursor / other clients** — add to the MCP config
(`claude_desktop_config.json`, `.cursor/mcp.json`, …):

```json
{
  "mcpServers": {
    "kaiten": {
      "command": "npx",
      "args": ["-y", "@nones/kaiten-mcp"],
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
        "token=\"$(sed -n 's/^KAITEN_API_TOKEN=//p' .env 2>/dev/null | head -n 1)\"; [ -n \"$token\" ] && export KAITEN_API_TOKEN=\"$token\"; exec npx -y @nones/kaiten-mcp"
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
      "args": ["-y", "@nones/kaiten-mcp"],
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
