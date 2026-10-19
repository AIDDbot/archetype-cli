import { resolve } from "node:path";
import { ExpectedError } from "#shared/errors/expected.error.ts";
import { isOneOf, isText } from "#shared/checks.guard.ts";
import type { SettingDefinition, SelectedSetting } from "#shared/settings/settings.type.ts";
function parsePath(name: string, value: unknown): string {
  if (!isText(value)) throw new ExpectedError("rule", `Invalid ${name}`);
  return value;
}
function parseLevel(value: unknown): string {
  if (!isOneOf(value, ["debug", "info", "warn", "error"] as const))
    throw new ExpectedError("rule", "Invalid LOG_LEVEL");
  return value;
}
export const definitions = [
  {
    name: "CONFIG_FILE",
    option: "config-file",
    fallback: "./config.json",
    parse: (value) => parsePath("CONFIG_FILE", value),
  },
  {
    name: "LOG_DIR",
    option: "log-dir",
    fallback: "./logs",
    parse: (value) => parsePath("LOG_DIR", value),
  },
  { name: "LOG_LEVEL", option: "log-level", fallback: "info", parse: parseLevel },
] as const satisfies readonly SettingDefinition[];
export interface SettingSources {
  argument: Record<string, unknown>;
  environment: Record<string, unknown>;
  file: Record<string, unknown>;
}
export function selectSetting(
  definition: SettingDefinition,
  sources: SettingSources,
): SelectedSetting {
  const origins = ["argument", "environment", "file"] as const;
  for (const source of origins) {
    const isSelfReference = definition.name === "CONFIG_FILE" && source === "file";
    if (isSelfReference) continue;
    const value = sources[source][definition.name];
    const isSet = value !== undefined;
    if (isSet) return { name: definition.name, value: parseSelected(definition, value), source };
  }
  return { name: definition.name, value: definition.fallback, source: "default" };
}
export interface LoggingSettings {
  directory: string | undefined;
  level: string;
}
/** The log settings before the configuration file opens: an invalid LOG_DIR writes no file; an invalid LOG_LEVEL takes its fallback. */
export function selectLogging(sources: SettingSources, directory: string): LoggingSettings {
  const [, folder, level] = definitions;
  const valid = (definition: SettingDefinition) => {
    try {
      return resolveSetting(selectSetting(definition, sources), directory).value;
    } catch {
      return undefined;
    }
  };
  return { directory: valid(folder), level: valid(level) ?? level.fallback };
}
export function resolveSetting(setting: SelectedSetting, directory: string): SelectedSetting {
  const isLevel = setting.name === "LOG_LEVEL";
  if (isLevel) return setting;
  return { ...setting, value: resolve(directory, setting.value) };
}

function parseSelected(definition: SettingDefinition, value: unknown) {
  try {
    return definition.parse(value);
  } catch {
    throw new ExpectedError("unavailable", `Invalid ${definition.name}`);
  }
}
