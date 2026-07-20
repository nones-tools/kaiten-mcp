# MCP tools

45 tools, grouped by domain. All responses are JSON in a text content block.

Tools also carry MCP annotations (`readOnlyHint`, `destructiveHint`) so clients can render or
gate them appropriately — see [Annotations](#annotations) below.

## Navigation

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_spaces` | — | Filtered by `KAITEN_ALLOWED_SPACE_IDS` when set. Read-only. |
| `kaiten_boards` | `spaceId?` | Defaults to `KAITEN_DEFAULT_SPACE_ID`. Read-only. |
| `kaiten_columns` | `boardId` | Read-only. |
| `kaiten_lanes` | `boardId` | Lists lanes on a board — use to discover `laneId` for `kaiten_create_card` / `kaiten_move_card`. Read-only. |

## Cards

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_cards` | `spaceId?`, `boardId?`, `minimal?` | `minimal: true` → token-optimized projection. Read-only. |
| `kaiten_card` | `cardId`, `simple?` | `simple` defaults to **true** (compact); pass `false` for the full payload. Read-only. |
| `kaiten_create_card` | `title`, `boardId`, `columnId`, `description?`, `laneId?`, `tags?`, `size?`, `plannedStart?`, `plannedEnd?` | Specify `laneId` when known (discover via `kaiten_lanes`) — otherwise the card lands on the board's default lane |
| `kaiten_update_card` | `cardId`, plus optional structured fields: `title`, `description`, `columnId`, `laneId`, `boardId`, `size`, `plannedStart`, `plannedEnd`, `dueDate`, `asap`, `condition`; legacy `data?` | Prefer the structured fields. `data` (JSON **string**) is **deprecated**, kept only for raw Kaiten fields not yet modeled — explicit structured fields win over the same key in `data`. At least one field is required. |
| `kaiten_delete_card` | `cardId` | Destructive. |
| `kaiten_move_card` | `cardId`, `columnId`, `laneId?` | Validates the column belongs to the card's board; error lists available columns. `laneId` discoverable via `kaiten_lanes`. |
| `kaiten_assign_card` | `cardId`, `userId` | |
| `kaiten_unassign_card` | `cardId`, `userId` | Remove a user assignment |
| `kaiten_archive_card` | `cardId` | Sets `condition` to archived |
| `kaiten_unarchive_card` | `cardId` | Sets `condition` back to active |
| `kaiten_find_cards` | `tagName`, `boardId?` | Returns only `id`, `title`, `board_id`, `column_id`, `tags`. Read-only. |

## Card hierarchy

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_create_child_card` | `parentId`, `title` | |
| `kaiten_get_child_cards` | `cardId` (one level) | Read-only. |
| `kaiten_get_all_child_cards` | `cardId` (recursive) | Read-only. |
| `kaiten_get_parent` | `cardId` | Read-only. |
| `kaiten_attach_to_parent` | `cardId`, `parentId`, `position?` | |
| `kaiten_detach_from_parent` | `cardId` | Destructive. |

## Comments & tags

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_add_comment` | `cardId`, `text` | |
| `kaiten_get_comments` | `cardId` | Read-only. |
| `kaiten_update_comment` | `commentId`, `text` | |
| `kaiten_delete_comment` | `commentId` | Destructive. |
| `kaiten_add_tag` | `cardId`, `tagName` | |
| `kaiten_remove_tag` | `cardId`, `tagName` | Destructive. |

## Checklists

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_get_checklists` | `cardId` | Read-only. |
| `kaiten_create_checklist` | `cardId`, `name` | |
| `kaiten_update_checklist` | `cardId`, `checklistId`, `name` | |
| `kaiten_delete_checklist` | `cardId`, `checklistId` | Destructive. |
| `kaiten_add_checklist_item` | `cardId`, `checklistId`, `text` | |
| `kaiten_toggle_checklist_item` | `cardId`, `checklistId`, `itemId`, `checked` | |
| `kaiten_delete_checklist_item` | `cardId`, `checklistId`, `itemId` | Destructive. |

## Files

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_get_files` | `cardId` | Read-only. |
| `kaiten_download_file` | `cardId`, `fileId`, `outputDir?` | Default dir `/tmp/kaiten/{cardId}/` |
| `kaiten_download_all_files` | `cardId`, `outputDir?` | |
| `kaiten_clean_temp` | `dir?` | Cleans `/tmp/kaiten/…`. Destructive. |

## Users

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_users` | — | Read-only. |
| `kaiten_search_users` | `query` | Read-only. |

## Git

Card-scoped git helpers operating on the current working directory
(branch naming: `feature/{cardId}-{slugified-title}`, commits: `[{cardId}] message`).

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_git_branch` | `cardId` | |
| `kaiten_git_checkout` | `cardId` | |
| `kaiten_git_commit` | `cardId`, `message?` | |
| `kaiten_git_status` | — | Read-only. |
| `kaiten_git_push` | `cardId` | |

## Annotations

Every tool registration carries optional MCP `annotations` (`readOnlyHint`, `destructiveHint`)
so clients can render or gate calls appropriately (e.g. skip a confirmation prompt for a
read-only tool, warn before a destructive one). Tools without an annotation noted above
default to neither hint set — treat them as ordinary mutations.

## Tool order

The registry order is a frozen contract for the first 39 tools (navigation → cards → comments
→ hierarchy → tags → git → users → checklists → files, matching the pre-3.0 hand-rolled
server). 3.1.0 appended 6 new tools at the end of the list — `kaiten_lanes`,
`kaiten_update_comment`, `kaiten_delete_comment`, `kaiten_archive_card`, `kaiten_unarchive_card`,
`kaiten_unassign_card` — without reordering or renaming anything that came before. New tools
are always appended, never interleaved, in future releases too.
