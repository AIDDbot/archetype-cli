import { ExpectedError } from "#shared/expected.error.ts";
import type { LogLevel } from "#shared/logging/logging.contract.ts";
import type { SettingDefinition } from "#shared/settings/settings.contract.ts";
import { isOneOf, isText } from "#shared/values/values.check.ts";

function path(value: unknown, name: string): string {
  const valid = isText(value);
  if (!valid)
    throw new ExpectedError({ kind: "unavailable", message: `Invalid path setting: ${name}` });
  return value;
}

function level(value: unknown): LogLevel {
  const valid = isOneOf(value, ["debug", "info", "warn", "error"] as const);
  if (!valid) throw new ExpectedError({ kind: "unavailable", message: "Invalid LOG_LEVEL" });
  return value;
}

export const configFile: SettingDefinition<string> = {
  name: "CONFIG_FILE",
  option: "config-file",
  fallback: "./config.json",
  check: (value) => path(value, "CONFIG_FILE"),
};
export const logDirectory: SettingDefinition<string> = {
  name: "LOG_DIR",
  option: "log-dir",
  fallback: "./logs",
  check: (value) => path(value, "LOG_DIR"),
};
export const logLevel: SettingDefinition<LogLevel> = {
  name: "LOG_LEVEL",
  option: "log-level",
  fallback: "info",
  check: level,
};
export const definitions: readonly SettingDefinition[] = [configFile, logDirectory, logLevel];
