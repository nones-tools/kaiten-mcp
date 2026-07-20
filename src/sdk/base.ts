import { KaitenApi } from '../kaiten/api/index.js';
import { loadConfig, type KaitenConfig } from '../kaiten/config.js';
import { KaitenClient } from '../kaiten/http/client.js';

export interface KaitenSDKOptions extends Partial<KaitenConfig> {
  client?: KaitenClient;
}

/**
 * Holds config/client/api construction only. Every actual SDK method is
 * added by a mixin in `src/sdk/mixins/*` (see `src/sdk.ts` for the compose
 * step) so no single file has to hold the SDK's full method set.
 */
export class KaitenSDKBase {
  readonly config: KaitenConfig;
  readonly client: KaitenClient;
  readonly api: KaitenApi;

  constructor(options: KaitenSDKOptions = {}) {
    const { client, ...configOverrides } = options;
    this.config = loadConfig(configOverrides);
    this.client = client ?? new KaitenClient({ apiUrl: this.config.apiUrl, apiToken: this.config.apiToken });
    this.api = new KaitenApi(this.client);
  }
}
