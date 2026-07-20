# @nones/kaiten-mcp

MCP (Model Context Protocol) server for [Kaiten](https://kaiten.ru) — lets Claude Code,
Claude Desktop, Cursor and other MCP clients manage your Kaiten boards: cards, child
cards, comments, tags, checklists, files and card-scoped git branches. Also ships a
`kaiten` CLI and a typed SDK.

## Setup

You need two values:

| Variable | Where to get it |
| --- | --- |
| `KAITEN_API_URL` | `https://<your-company>.kaiten.ru/api/latest` |
| `KAITEN_API_TOKEN` | Kaiten → Profile settings → API tokens → Create token |

**Claude Code:**

```bash
claude mcp add kaiten \
  -e KAITEN_API_URL=https://your-company.kaiten.ru/api/latest \
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
        "KAITEN_API_URL": "https://your-company.kaiten.ru/api/latest",
        "KAITEN_API_TOKEN": "your_token"
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

## Documentation

- [Configuration](docs/configuration.md) — all variables, config files, precedence, allowlists
- [MCP tools](docs/tools.md) — all 39 tools and their token-saving flags
- [CLI](docs/cli.md) — the `kaiten` command reference
- [SDK](docs/sdk.md) — programmatic usage from Node/Bun
- [Architecture](docs/architecture.md) — layers, Kaiten Core, design decisions
- [Development](docs/development.md) — building, testing, releasing

## Requirements

Node.js >= 18. No other runtime dependencies beyond the MCP SDK.

## License

MIT
