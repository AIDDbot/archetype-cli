import { ExpectedError } from "#shared/expected.error.ts";
import type { Settings } from "#shared/settings/settings.type.ts";
export function createConfigService(settings: Settings) {
  return {
    get(name?: string) {
      const isAll = name === undefined;
      if (isAll) return { settings: settings.list() };
      const setting = settings.list().find((item) => item.name === name);
      const isKnown = setting !== undefined;
      if (!isKnown) throw new ExpectedError("usage", `Unknown setting: ${name}`);
      return setting;
    },
    set: (name: string, value: string) => settings.set(name, value),
  };
}
