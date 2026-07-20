import type { KaitenApi } from '../kaiten/api/index.js';
import type { KaitenConfig } from '../kaiten/config.js';

/**
 * The slice of `KaitenSDK` that the per-domain operation modules need.
 * `KaitenSDK` itself satisfies this structurally, so its methods can pass
 * `this` straight through without any adapter object.
 */
export interface SdkContext {
  readonly config: KaitenConfig;
  readonly api: KaitenApi;
}
