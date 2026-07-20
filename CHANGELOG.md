# Changelog

All notable changes to `@nones/kaiten-mcp` are documented here. Versioning follows
[SemVer](https://semver.org/): breaking MCP tool contract changes (renames, removals,
required-ness/type changes) bump the major version; new tools and new optional params are
additive and ship in a minor version (constitution Principle IV, amended 1.1.0).

## 3.1.0 — 2026-07-20

AI-agent ergonomics pass on the MCP tool API. No breaking changes — the 39 tools from 3.0.0
keep their exact names, parameters, order and defaults.

### Added

- **Structured fields on `kaiten_update_card`.** In addition to the legacy `data` JSON
  string, the tool now accepts `title`, `description`, `columnId`, `laneId`, `boardId`,
  `size`, `plannedStart`, `plannedEnd`, `dueDate`, `asap` and `condition` directly. `data`
  is now optional and marked deprecated; explicit structured fields win over the same key
  inside `data` when both are given. At least one field must be supplied.
- **`tags`, `size`, `plannedStart`, `plannedEnd` on `kaiten_create_card`** — the SDK already
  accepted them; the tool now exposes them too.
- **`kaiten_lanes`** — list the lanes of a board, so agents can discover `laneId` values for
  `kaiten_create_card` / `kaiten_move_card` instead of having to read them off an existing
  card. Backed by a new `BoardsApi.getLanes()` (`GET /boards/{boardId}/lanes`) and a new
  `Lane` entity type.
- Five new tools closing pre-existing gaps between the SDK and the MCP surface (the SDK
  methods already existed; they had no tool wrapper before):
  - `kaiten_update_comment` (`commentId`, `text`)
  - `kaiten_delete_comment` (`commentId`)
  - `kaiten_archive_card` (`cardId`)
  - `kaiten_unarchive_card` (`cardId`)
  - `kaiten_unassign_card` (`cardId`, `userId`)
- **MCP tool annotations** (`readOnlyHint`, `destructiveHint`) on every tool definition,
  passed through to the MCP SDK's `registerTool`, so clients can render/gate calls
  appropriately (e.g. skip confirmation UI for read-only tools, warn before destructive
  ones).
- Server version is now read from `package.json` at runtime instead of being hardcoded, so
  `serverInfo.version` in the MCP handshake can never drift from the published version.

### Changed

- `kaiten_create_card` / `kaiten_move_card` descriptions now point agents at `kaiten_lanes`
  to discover `laneId` values (previously suggested reading it off an existing card via
  `kaiten_card`).
- Tool registry grew from 39 to 45 tools. The original 39 keep their exact order; the 6 new
  tools (`kaiten_lanes`, `kaiten_update_comment`, `kaiten_delete_comment`,
  `kaiten_archive_card`, `kaiten_unarchive_card`, `kaiten_unassign_card`) are appended at
  the end of the registry, never interleaved with the existing sequence.
- Constitution Principle IV amended (1.0.0 → 1.1.0) to explicitly allow additive MCP tool
  contract changes (new tools, new optional params) in minor versions, while still
  requiring a major bump for renames, removals or semantics changes.

## 3.0.0 — 2026-07-20

Full TypeScript rewrite of the project (previously a hand-rolled JS server). No intentional
behavior change versus the pre-rewrite server — this release freezes that behavior as the
tested contract going forward.

### Added

- Layered TypeScript architecture: `src/kaiten` (self-contained Kaiten Core: entities, HTTP
  client, API resource classes, config loading), `src/services` (business logic — access
  guard, projections, domain services), `src/sdk.ts` (`KaitenSDK` facade, the package's
  public API), `src/mcp` (MCP adapter: tools by domain + a hook middleware chain), `src/cli`
  (CLI adapter: commands, projections, help).
- MCP server rebuilt on the official `@modelcontextprotocol/sdk`, registering all 39 tools
  from the original hand-rolled server, verified to match it exactly (names, schemas,
  required params, defaults, order).
- Bun as the toolchain: `bun test` (204 tests, no network/credentials required) and
  `bunx tsc --noEmit` gate every change; `bun run build` bundles to `dist/` for Node >= 18.
- Spec Kit artifacts (`specs/`, `.specify/`) and a project constitution
  (`.specify/memory/constitution.md`) formalizing the AI-first, layered, behavior-preserving
  rules the codebase already followed informally.
- Human documentation under `docs/` (configuration, tools, CLI, SDK, architecture,
  development) plus `AGENTS.md` as the map for AI coding agents.
- Package renamed to `@nones/kaiten-mcp`.

### Changed

- `laneId` support in `kaiten_create_card` / `kaiten_move_card`, and a fixed `minimal` flag
  behavior in card tools (carried over from the pre-rewrite server's last patch release).
