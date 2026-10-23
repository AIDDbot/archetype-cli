import { join } from "node:path";
import { expect } from "vitest";
import { readTable } from "#shared/page-objects/output.read.ts";
import type { CliResult } from "./cli.contract.ts";
import type { JsonInvocation } from "./cli.json.ts";
type SettingValue = { name: string; value: string; source: string };
type InvalidSetting = { name: string; code: number };

export function expectSetting(result: JsonInvocation, entry: SettingValue): void {
  expect(result.code).toBe(0);
  expect(result.object).toEqual(entry);
}
export function expectInvalidSetting(result: CliResult, entry: InvalidSetting): void {
  expect(result.code).toBe(entry.code);
  expect(result.stderr).toContain(entry.name);
}
export function expectUnchangedSettings(before: CliResult, after: CliResult): void {
  expect(before.code).toBe(0);
  expect(after.code).toBe(0);
  expect(after.stdout).toBe(before.stdout);
}
export function expectSettingsTable(result: CliResult, directory: string): void {
  expect(result.code).toBe(0);
  expect(readTable(result.stdout)).toEqual(
    expect.arrayContaining([
      { Setting: "CONFIG_FILE", Value: join(directory, "config.json"), Source: "environment" },
      { Setting: "LOG_DIR", Value: join(directory, "logs"), Source: "environment" },
      { Setting: "LOG_LEVEL", Value: "info", Source: "default" },
    ]),
  );
}
export function expectSettingsList(result: JsonInvocation, directory: string): void {
  expect(result.code).toBe(0);
  expect(result.object.settings).toEqual(
    expect.arrayContaining([
      { name: "CONFIG_FILE", value: join(directory, "config.json"), source: "environment" },
      { name: "LOG_DIR", value: join(directory, "logs"), source: "environment" },
      { name: "LOG_LEVEL", value: "info", source: "default" },
    ]),
  );
}
export function expectSettingText(result: CliResult, value: string): void {
  expect(result.code).toBe(0);
  expect(result.stdout).toBe(`${value}\n`);
}
