// Root package barrel. Re-exports the whole Kaiten Core (types, http client,
// resource APIs, config loading) plus the app-level SDK facade - this is the
// public `@nones/kaiten-mcp` package API and must stay backward-compatible.
export * from './kaiten/index.js';
export { createSDK, KaitenSDK } from './sdk.js';
export type { KaitenSDKOptions } from './sdk.js';
