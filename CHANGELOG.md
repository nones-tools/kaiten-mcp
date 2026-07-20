# Changelog

All notable changes to `@nones/kaiten-mcp` are documented here. Versioning follows
[SemVer](https://semver.org/): breaking MCP tool contract changes (renames, removals,
required-ness/type changes) bump the major version; new tools and new optional params are
additive and ship in a minor version (constitution Principle IV, amended 1.1.0).

## 3.2.2 — 2026-07-20

### Added

- CI/CD via GitHub Actions (`.github/workflows/release.yml`): triggered only by a
  `chore: X.Y.Z` release commit on `master` (regular commits never run CI). Pipeline:
  Biome lint -> typecheck -> tests -> build -> Node smoke-test -> `npm publish`
  (`@nones/kaiten-mcp`) -> GitHub Packages mirror (`@zeizel/kaiten-mcp`) -> git tag +
  GitHub Release with notes from this changelog.
- `bun run release patch|minor|major|X.Y.Z` script: local gates, version bump,
  changelog roll, `chore: X.Y.Z` commit and push.
- Biome linter (`bun run lint`), zero diagnostics across src/tests/scripts.

## 3.2.1 — 2026-07-20

### Added

- **Dependency injection composition root** (`src/di/`), NestJS/Angular-style, built on
  `inversify`. `TOKENS` (typed `Symbol`s) and `buildContainer(overrides?)` are now
  exported from the package root, alongside `KaitenApiPort` and the per-resource port
  types (`CardsApiPort`, `BoardsApiPort`, …) from `src/kaiten/interfaces/ports.ts`.
- Every class in `src/services/` is now `@injectable()` with constructor dependencies
  resolved via `@inject(TOKENS.X)`, and depends on `KaitenApiPort`/`HttpTransport`
  instead of the concrete `KaitenApi`/`KaitenClient` classes. `KaitenApi implements
  KaitenApiPort`.
- New runtime dependencies: `inversify` and `reflect-metadata` (constitution amended to
  1.2.0). `src/kaiten/` (Kaiten Core) stays undecorated and framework-free — nothing
  under it imports `inversify`; `KaitenClient`/`KaitenApi` are bound in the container via
  factory bindings (`toDynamicValue`).

- TypeScript path alias `@/*` → `src/*` (tsconfig `paths`); test suite imports through it.

### Changed

- Relative imports lost their `.js` extensions; cross-directory imports go through
  directory barrels; `node:` import prefixes replaced with bare specifiers (identical
  behavior on Node and Bun).
- README: manual MCP connection recipe (token read from a local `.env` via `sh -c`),
  Kaiten URLs generalized to `https://<kaiten_url>/api/latest`.

No breaking changes: `new KaitenSDK(options)` / `createSDK(options)` keep their exact
pre-DI constructor signature and behavior (they build a container internally), and every
existing root export is unchanged.

## 3.2.0 — 2026-07-20

New Kaiten API coverage, researched against the official docs (https://developers.kaiten.ru/).
No breaking changes — the 45 tools from 3.1.0 keep their exact names, parameters, order and
defaults.

### Added

- **`KAITEN_API_DELETE_ALLOW` gate is now applied to every DELETE-backed tool**, including the
  two new ones below (`kaiten_unblock_card`, `kaiten_remove_external_link`) - all HTTP DELETE
  calls go through `KaitenClient.delete()`, the single enforcement point, so nothing can bypass
  it.
- **Time logs** (`GET`/`POST /cards/{card_id}/time-logs`):
  - `kaiten_get_time_logs` (`cardId`)
  - `kaiten_add_time_log` (`cardId`, `timeSpent` in minutes, `forDate` `YYYY-MM-DD`, `roleId`,
    `comment?`)
- **Card blockers** (`/cards/{card_id}/blockers`):
  - `kaiten_get_blockers` (`cardId`)
  - `kaiten_block_card` (`cardId`, `reason?`, `blockerCardId?`)
  - `kaiten_unblock_card` (`cardId`, `blockerId`) - destructive, requires
    `KAITEN_API_DELETE_ALLOW=true`
- **External links** (`/cards/{card_id}/external-links`) - useful for attaching PR/issue URLs
  to a card:
  - `kaiten_get_external_links` (`cardId`)
  - `kaiten_add_external_link` (`cardId`, `url`, `description?`)
  - `kaiten_remove_external_link` (`cardId`, `linkId`) - destructive, requires
    `KAITEN_API_DELETE_ALLOW=true`
- **Company dictionaries** (read-only, no space/board/card scoping):
  - `kaiten_tags` (`query?`, `spaceId?`) - `GET /tags`
  - `kaiten_card_types` - `GET /card-types`
  - `kaiten_custom_properties` - `GET /company/custom-properties`; values are set on cards via
    `kaiten_update_card`'s legacy `data` with `{"properties": {"id_<propertyId>": value}}`
- **`kaiten_current_user`** - `GET /users/current`, exposing the SDK's pre-existing
  `getCurrentUser()`.
- **`kaiten_attach_file`** (`cardId`, `filePath`, `fileName?`) - reads a local file and uploads
  it to a card via `PUT /cards/{card_id}/files` as `multipart/form-data` (part name `file`).
  Backed by a new `KaitenClient.putForm()` that lets `fetch` set the multipart boundary itself
  (no manual `Content-Type`).
- **`typeId` on `kaiten_create_card`** - optional card type id (`type_id` in the request body),
  discoverable via `kaiten_card_types`.

### Changed

- Tool registry grew from 45 to 58 tools. The 45 from 3.1.0 keep their exact order; the 13 new
  tools (`kaiten_current_user`, `kaiten_tags`, `kaiten_card_types`, `kaiten_custom_properties`,
  `kaiten_get_time_logs`, `kaiten_add_time_log`, `kaiten_get_blockers`, `kaiten_block_card`,
  `kaiten_unblock_card`, `kaiten_get_external_links`, `kaiten_add_external_link`,
  `kaiten_remove_external_link`, `kaiten_attach_file`) are appended at the end of the registry,
  never interleaved with the existing sequence.

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
