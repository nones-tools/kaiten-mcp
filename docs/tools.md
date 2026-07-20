# MCP tools

39 tools, grouped by domain. All responses are JSON in a text content block.

## Navigation

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_spaces` | — | Filtered by `KAITEN_ALLOWED_SPACE_IDS` when set |
| `kaiten_boards` | `spaceId?` | Defaults to `KAITEN_DEFAULT_SPACE_ID` |
| `kaiten_columns` | `boardId` | |

## Cards

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_cards` | `spaceId?`, `boardId?`, `minimal?` | `minimal: true` → token-optimized projection |
| `kaiten_card` | `cardId`, `simple?` | `simple` defaults to **true** (compact); pass `false` for the full payload |
| `kaiten_create_card` | `title`, `boardId`, `columnId`, `description?`, `laneId?` | Specify `laneId` when known — otherwise the card lands on the board's default lane |
| `kaiten_update_card` | `cardId`, `data` | `data` is a JSON **string** of fields to patch |
| `kaiten_delete_card` | `cardId` | |
| `kaiten_move_card` | `cardId`, `columnId`, `laneId?` | Validates the column belongs to the card's board; error lists available columns |
| `kaiten_assign_card` | `cardId`, `userId` | |
| `kaiten_find_cards` | `tagName`, `boardId?` | Returns only `id`, `title`, `board_id`, `column_id`, `tags` |

## Card hierarchy

| Tool | Params |
| --- | --- |
| `kaiten_create_child_card` | `parentId`, `title` |
| `kaiten_get_child_cards` | `cardId` (one level) |
| `kaiten_get_all_child_cards` | `cardId` (recursive) |
| `kaiten_get_parent` | `cardId` |
| `kaiten_attach_to_parent` | `cardId`, `parentId`, `position?` |
| `kaiten_detach_from_parent` | `cardId` |

## Comments & tags

| Tool | Params |
| --- | --- |
| `kaiten_add_comment` | `cardId`, `text` |
| `kaiten_get_comments` | `cardId` |
| `kaiten_add_tag` | `cardId`, `tagName` |
| `kaiten_remove_tag` | `cardId`, `tagName` |

## Checklists

| Tool | Params |
| --- | --- |
| `kaiten_get_checklists` | `cardId` |
| `kaiten_create_checklist` | `cardId`, `name` |
| `kaiten_update_checklist` | `cardId`, `checklistId`, `name` |
| `kaiten_delete_checklist` | `cardId`, `checklistId` |
| `kaiten_add_checklist_item` | `cardId`, `checklistId`, `text` |
| `kaiten_toggle_checklist_item` | `cardId`, `checklistId`, `itemId`, `checked` |
| `kaiten_delete_checklist_item` | `cardId`, `checklistId`, `itemId` |

## Files

| Tool | Params | Notes |
| --- | --- | --- |
| `kaiten_get_files` | `cardId` | |
| `kaiten_download_file` | `cardId`, `fileId`, `outputDir?` | Default dir `/tmp/kaiten/{cardId}/` |
| `kaiten_download_all_files` | `cardId`, `outputDir?` | |
| `kaiten_clean_temp` | `dir?` | Cleans `/tmp/kaiten/…` |

## Users

| Tool | Params |
| --- | --- |
| `kaiten_users` | — |
| `kaiten_search_users` | `query` |

## Git

Card-scoped git helpers operating on the current working directory
(branch naming: `feature/{cardId}-{slugified-title}`, commits: `[{cardId}] message`).

| Tool | Params |
| --- | --- |
| `kaiten_git_branch` | `cardId` |
| `kaiten_git_checkout` | `cardId` |
| `kaiten_git_commit` | `cardId`, `message?` |
| `kaiten_git_status` | — |
| `kaiten_git_push` | `cardId` |
