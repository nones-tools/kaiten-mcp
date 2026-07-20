# Development

Toolchain is [Bun](https://bun.sh); the published package runs on plain Node >= 18.

```bash
bun install
bun run dev        # MCP server in watch mode (stdio)
bun run dev:cli    # CLI from sources
bun test           # full suite — no network or credentials needed
bun run typecheck  # tsc --noEmit (strict)
bun run build      # bundle to dist/ (Node target, deps external) + emit .d.ts
bun run pack       # build + create the npm tarball (bun pm pack)
```

## Testing the MCP server by hand

```bash
printf '%s\n%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node dist/mcp/server.js
```

## Project workflow

- Work items: **beads** (`bd ready`, `bd create`, `bd close`) — see `AGENTS.md`.
- Feature process: **Spec Kit** (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks`
  → `/speckit-implement`); artifacts in `specs/`, principles in
  `.specify/memory/constitution.md`.
- Quality gates before any commit: `bun test` and `bunx tsc --noEmit` green.

## Releasing

```bash
# bump "version" in package.json, then:
npm publish            # prepublishOnly runs the build; publishConfig.access=public
```

For a private registry: `bun run pack` and push the tarball, or
`npm publish --registry=<url>`.
