import type { Identity } from "#shared/identity.type.ts";

import type { Registration } from "#shared/output/command.contract.ts";
export type FeatureManifest = readonly Registration[];
export type Application = { features: FeatureManifest; identity: Identity };

export function createApp(options: Application): Application {
  return { features: options.features, identity: options.identity };
}
