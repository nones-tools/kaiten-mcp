# Architecture

Three delivery surfaces (MCP server, CLI, SDK) over one core, in strict layers —
dependencies point inward only:

```
┌────────────────────────────── adapters ─────────────────────────────┐
│  src/mcp/   tools/ (58 tools by domain) + hooks/ (middleware chain) │
│  src/cli/   commands/ registry + projections + help                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ calls only the facade
┌──────────────────────────────▼──────────────────────────────────────┐
│  src/sdk.ts        KaitenSDK — facade, the package's public API     │
│  src/services/     AccessGuard (allowlists), projections,           │
│                    domain services (cards, hierarchy, tags, …)      │
│  src/lib/          git + temp-dir helpers (not Kaiten API)          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ depends only on the core
┌──────────────────────────────▼──────────────────────────────────────┐
│  src/kaiten/       KAITEN CORE (future @nones/kaiten-core)          │
│    interfaces/     entity types (Card, Board, Column, User, …)      │
│    http/           KaitenClient (fetch adapter) + KaitenApiError    │
│    api/            resource classes → KaitenApi aggregate           │
│    config.ts       loadConfig / parseEnvFile                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Patterns in use

- **Facade** — `KaitenSDK` composes the core client, `AccessGuard` and domain services;
  every public method is a thin delegation. Adapters never bypass it.
- **Adapter** — `KaitenClient` adapts native `fetch` to a typed `HttpTransport`
  interface; API resources depend on the interface, which is how tests inject a fake
  transport (no network in the suite).
- **Chain of responsibility** — MCP tool calls run through a middleware chain
  (`src/mcp/hooks/`): logging → error formatting → handler. Error formatting produces
  the exact `Tool <name> failed: …` contract, including HTTP status/body for
  `KaitenApiError` and the actionable missing-config guidance.
- **Command registry** — CLI commands are self-contained objects dispatched by name;
  adding a command touches one file plus the registry.

## Rules that keep it maintainable (see constitution)

- No source file over **200 lines**; one domain concept per file; layers expose barrels.
- `src/kaiten/` is import-isolated — nothing inside it may import from outside.
  **Standing decision:** it will be extracted into a standalone `@nones/kaiten-core`
  package (beads epic `kaiten-mcp-jtg`), with this repo depending on it.
- stdout is reserved for the MCP protocol; all logs go to stderr.
- Public contracts (tool names/schemas, CLI output, root exports) only change with a
  major version bump.

## Build

`bun build` bundles three entries (`src/index.ts`, `src/cli/index.ts`,
`src/mcp/server.ts`) for the Node target with dependencies external;
`tsc --emitDeclarationOnly` produces the `.d.ts` files. The published artifact contains
only `dist/` + `README.md` and runs on plain Node >= 18.
