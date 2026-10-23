import { resolve } from "node:path";
import { ExpectedError } from "#shared/expected.error.ts";
import type {
  SettingDefinition,
  SettingSource,
  SettingSources,
  SettingValue,
  Settings,
} from "#shared/settings/settings.contract.ts";
import { configFile, definitions } from "./settings.definitions.ts";
import { readSetting } from "./settings.read.ts";

export type SettingsInput = {
  directory: string;
  sources: () => SettingSources;
  write: (file: string, text: string) => Promise<void>;
};
type Candidate = { source: SettingSource; value: unknown };

function definitionFor(name: string): SettingDefinition {
  const definition = definitions.find((item) => item.name === name);
  const unknown = definition === undefined;
  if (unknown) throw new ExpectedError({ kind: "usage", message: `Unknown setting: ${name}` });
  return definition;
}

function settingValue(definition: SettingDefinition, sources: SettingSources): SettingValue {
  const fromFile = definition.name !== "CONFIG_FILE";
  const candidates: readonly Candidate[] = [
    { source: "argument", value: sources.options[definition.option] },
    { source: "environment", value: sources.environment[definition.name] },
    { source: "file", value: fromFile ? sources.configuration[definition.name] : undefined },
  ];
  const candidate = candidates.find((item) => item.value !== undefined);
  return {
    name: definition.name,
    value: String(readSetting(definition, sources)),
    source: candidate?.source ?? "default",
  };
}

function checkedValue(definition: SettingDefinition, value: string): unknown {
  try {
    return definition.check(value);
  } catch {
    throw new ExpectedError({ kind: "rule", message: `Invalid setting: ${definition.name}` });
  }
}

async function saveSetting(input: SettingsInput, entry: SettingValue): Promise<void> {
  const sources = input.sources();
  const path = resolve(input.directory, readSetting(configFile, sources));
  const configuration = { ...sources.configuration, [entry.name]: entry.value };
  try {
    await input.write(path, `${JSON.stringify(configuration, null, 2)}\n`);
  } catch {
    throw new ExpectedError({
      kind: "unavailable",
      message: `Cannot write configuration: ${path}`,
    });
  }
}

export function manageSettings(input: SettingsInput): Settings {
  return {
    readSetting: (definition) => readSetting(definition, input.sources()),
    listSettings: () => definitions.map((definition) => settingValue(definition, input.sources())),
    getSetting: (name) => settingValue(definitionFor(name), input.sources()),
    setSetting: async (name, value) => {
      const checked = checkedValue(definitionFor(name), value);
      await saveSetting(input, { name, value: String(checked), source: "file" });
    },
  };
}
