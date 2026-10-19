import { ExpectedError } from "#shared/expected.error.ts";
import type { SelectedSetting, Settings } from "#shared/settings/settings.type.ts";
export interface ConfigService {
  get(name?: string): { settings: SelectedSetting[] } | SelectedSetting;
  set(name: string, value: string): Promise<void>;
}
export function createConfigService(settings: Settings): ConfigService {
  return {
    get(name) {
      const isAll = name === undefined;
      if (isAll) return { settings: settings.list() };
      const setting = settings.list().find((item) => item.name === name);
      const isKnown = setting !== undefined;
      if (!isKnown) throw new ExpectedError("usage", `Unknown setting: ${name}`);
      return setting;
    },
    set: (name, value) => settings.set(name, value),
  };
}
