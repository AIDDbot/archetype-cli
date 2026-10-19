import { definitions, selectSetting, resolveSetting } from "./app.settings.ts";
import { createConfigurationStorage } from "./app.storage.ts";
import type { ConfigurationStorage } from "#shared/settings/configuration.type.ts";
import { requireByName } from "#shared/checks.guard.ts";
import type { SettingSources } from "./app.settings.ts";
import type { Settings } from "#shared/settings/settings.type.ts";
export async function createSettings(
  input: {
    sources: SettingSources;
    directory: string;
  },
  storage: ConfigurationStorage = createConfigurationStorage(),
): Promise<Settings> {
  const { sources, directory } = input;
  const configuration = resolveSetting(selectSetting(definitions[0], sources), directory);
  sources.file = await storage.read(configuration.value);
  const selected = definitions.map((definition) =>
    resolveSetting(selectSetting(definition, sources), directory),
  );
  return {
    list: () => selected,
    get: (name) => requireByName(selected, { name, kind: "setting" }).value,
    async set(name, value) {
      const definition = requireByName(definitions, { name, kind: "setting" });
      const checked = definition.parse(value);
      await storage.write(configuration.value, { ...sources.file, [name]: checked });
    },
  };
}
