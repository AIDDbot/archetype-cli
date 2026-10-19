import { ExpectedError } from "#shared/errors/expected.error.ts";
import type { Settings } from "#shared/settings/settings.type.ts";
export function createConfigService(settings: Settings) {
  return {
    get(name?: string) {
      if (name === undefined) return { settings: settings.list() };
      const setting = settings.list().find((item) => item.name === name);
      if (setting === undefined) throw new ExpectedError("usage", `Unknown setting: ${name}`);
      return setting;
    },
    set: (name: string, value: string) => settings.set(name, value),
  };
}
