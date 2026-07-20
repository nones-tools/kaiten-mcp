# CLI

```bash
npm install -g @nones/kaiten-mcp   # installs the `kaiten` and `kaiten-mcp` binaries
```

Configuration is the same as for the MCP server — see [configuration.md](configuration.md).
Run `kaiten help` for the built-in reference (currently in Russian).

## Cards

```bash
kaiten cards                     # card list (JSON)
kaiten card <id>                 # card details (JSON)
kaiten simple                    # human-readable card list
kaiten card-simple <id>          # human-readable card details
kaiten create '<json>'           # e.g. '{"title":"Task","boardId":123,"columnId":456}'
kaiten update <id> '<json>'
kaiten delete <id>
kaiten move <id> <column_id> [lane_id]
kaiten assign <id> <user_id>
```

## Child cards, comments, navigation

```bash
kaiten subtask create <parent_id> <title>
kaiten subtask list <parent_id>
kaiten comment add <card_id> <text>
kaiten comment list <card_id>
kaiten board [space_id]          # boards of a space
kaiten column <board_id>         # columns of a board
kaiten user [query]              # find user / list users
```

## Tags & search

```bash
kaiten tag add <card_id> <tag>
kaiten tag remove <card_id> <tag>
kaiten tag list                  # cards that have tags
kaiten tag filter <tag> [-m]     # -m/--minimal → compact JSON
kaiten find <tag> [-m] [--board=<id|name>]
```

## Git workflow

```bash
kaiten git-branch <card_id>      # create feature/<id>-<slug> branch
kaiten git-checkout <card_id>
kaiten git-commit <card_id> [msg]  # default message: "Work in progress"
kaiten git-status
kaiten git-push <card_id>
```

Exit codes: `0` success, `1` on errors, missing arguments or unknown commands.
