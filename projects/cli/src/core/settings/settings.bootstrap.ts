import { resolve } from "node:path";
import type { LogLevel } from "#shared/logging/logging.contract.ts";
import type { SettingDefinition, SettingSources } from "#shared/settings/settings.contract.ts";
import { logDirectory, logLevel } from "./settings.definitions.ts";
import { readSetting } from "./settings.read.ts";

export type BootstrapInput = { directory: string; sources: SettingSources };
export type LoggingSettings = { directory: string | undefined; level: LogLevel };

function safeSetting<Value>(
  definition: SettingDefinition<Value>,
  sources: SettingSources,
): Value | undefined {
  try {
    return readSetting(definition, sources);
  } catch {
    return undefined;
  }
}

export function loggingSettings(input: BootstrapInput): LoggingSettings {
  const directory = safeSetting(logDirectory, input.sources);
  const unavailable = directory === undefined;
  return {
    directory: unavailable ? undefined : resolve(input.directory, directory),
    level: safeSetting(logLevel, input.sources) ?? logLevel.fallback,
  };
}
