/** Shared constructor type for the `KaitenSDK` mixin chain (see sdk.ts). */
export type Constructor<T = object> = new (...args: any[]) => T;
