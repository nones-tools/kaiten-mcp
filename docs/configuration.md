# Configuration

Settings are merged from the following sources, highest precedence first:

1. Environment variables (`process.env`) — this is what MCP clients' `env` blocks set
2. `./.kaiten.env` — per-project settings, safe to commit (IDs only, no secrets)
3. `./.env`
4. `~/.kaiten/config` — global settings, the right place for your token

All files use plain `KEY=VALUE` lines; `#` starts a comment.

## Variables

| Variable | Required | Description |
| --- | --- | --- |
| `KAITEN_API_URL` | yes | e.g. `https://your-company.kaiten.ru/api/latest` |
| `KAITEN_API_TOKEN` | yes | Kaiten API token (Profile settings → API tokens) |
| `KAITEN_DEFAULT_SPACE_ID` | no | Space used when `spaceId` is not passed |
| `KAITEN_DEFAULT_BOARD_ID` | no | Board used when `boardId` is not passed |
| `KAITEN_ALLOWED_SPACE_IDS` | no | Comma-separated allowlist; operations outside it are rejected |
| `KAITEN_ALLOWED_BOARD_IDS` | no | Comma-separated allowlist; operations outside it are rejected |
| `KAITEN_LOG_LEVEL` | no | `error` \| `warn` \| `info` (default) \| `debug` — logs go to stderr |
| `KAITEN_TEMP_DIR` | no | Directory for downloaded card files (default `/tmp/kaiten`) |
| `KAITEN_API_DELETE_ALLOW` | no | Set to `true` to enable DELETE tools (default disabled — see [Destructive operations](../README.md#destructive-operations)) |

## Examples

Global credentials in `~/.kaiten/config`:

```ini
KAITEN_API_URL=https://your-company.kaiten.ru/api/latest
KAITEN_API_TOKEN=your_token
```

Per-project defaults in `./.kaiten.env` (committable — contains no secrets):

```ini
KAITEN_DEFAULT_SPACE_ID=12345
KAITEN_DEFAULT_BOARD_ID=67890
```

## Allowlists

When `KAITEN_ALLOWED_SPACE_IDS` / `KAITEN_ALLOWED_BOARD_IDS` are set, every operation is
validated against them: listing spaces filters to allowed ones, and card operations check
the card's board. Useful to keep an AI agent scoped to one project's boards.

## Destructive operations (DELETE gate)

Every HTTP DELETE call to the Kaiten API (`kaiten_delete_card`, `kaiten_delete_checklist`,
`kaiten_delete_checklist_item`, `kaiten_delete_comment`, `kaiten_remove_tag`,
`kaiten_detach_from_parent`) is disabled by default. Calling one throws an actionable error
unless `KAITEN_API_DELETE_ALLOW` is set to exactly `true` (case-insensitive) — any other value,
including unset, keeps DELETE disabled. This is enforced at the HTTP client layer, so it cannot
be bypassed by any tool, service, or SDK method. See the README's
[Destructive operations](../README.md#destructive-operations) section for how to enable it.
`kaiten_clean_temp` is unaffected — it only deletes local temp files, never Kaiten data.

## Missing configuration

Without `KAITEN_API_URL` / `KAITEN_API_TOKEN` the server starts (so `tools/list` works),
but every tool call returns an actionable error explaining which variables to set and
where. AI agents are expected to relay that error to the user verbatim.
