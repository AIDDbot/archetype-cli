import { ExpectedError } from "#shared/expected.error.ts";
import type { Settings, SettingValue } from "#shared/settings/settings.contract.ts";

export type ConfigRequest = { arguments: readonly string[]; settings: Settings };
export type ConfigResult =
  | { settings: readonly [SettingValue]; single: true }
  | { settings: readonly SettingValue[]; single: false };

export async function configureSettings(input: ConfigRequest): Promise<ConfigResult> {
  const [operation, name, value] = input.arguments;
  const get = operation === "get";
  if (get) return getSettings(input);
  const set = operation === "set";
  const complete = name !== undefined && value !== undefined;
  const valid = set && complete;
  if (valid) {
    await input.settings.setSetting(name, value);
    return { settings: [], single: false };
  }
  throw new ExpectedError({
    kind: "usage",
    message: "Usage: config get [name] | config set <name> <value>",
  });
}

function getSettings(input: ConfigRequest): ConfigResult {
  const name = input.arguments[1];
  const all = name === undefined;
  if (all) return { settings: input.settings.listSettings(), single: false };
  return { settings: [input.settings.getSetting(name)], single: true };
}
