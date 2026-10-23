import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import type { SettingSources } from "#shared/settings/settings.contract.ts";
import { logLevel } from "./settings.definitions.ts";
import { manageSettings, type SettingsInput } from "./settings.manage.ts";

function fixture(sources: SettingSources) {
  const write = vi.fn<SettingsInput["write"]>(async (_file: string, _text: string) => {});
  const settings = manageSettings({ directory: "/project", sources: () => sources, write });
  return { settings, write };
}
it("reads definitions and each effective source", () => {
  const { settings } = fixture({
    options: { "config-file": "custom" },
    environment: { LOG_DIR: "env" },
    configuration: { LOG_LEVEL: "warn" },
  });
  expect(settings.readSetting(logLevel)).toBe("warn");
  expect(settings.listSettings()).toEqual([
    { name: "CONFIG_FILE", value: "custom", source: "argument" },
    { name: "LOG_DIR", value: "env", source: "environment" },
    { name: "LOG_LEVEL", value: "warn", source: "file" },
  ]);
  expect(settings.getSetting("LOG_LEVEL")).toEqual({
    name: "LOG_LEVEL",
    value: "warn",
    source: "file",
  });
});
it("uses defaults and ignores CONFIG_FILE inside the file", () => {
  const { settings } = fixture({
    options: {},
    environment: {},
    configuration: { CONFIG_FILE: "ignored" },
  });
  expect(settings.getSetting("CONFIG_FILE")).toEqual({
    name: "CONFIG_FILE",
    value: "./config.json",
    source: "default",
  });
});
it("validates before writing and preserves other keys", async () => {
  const { settings, write } = fixture({
    options: {},
    environment: {},
    configuration: { LOG_DIR: "other", extension: 7 },
  });
  await settings.setSetting("LOG_LEVEL", "warn");
  expect(write).toHaveBeenCalledExactlyOnceWith(
    resolve("/project", "config.json"),
    '{\n  "LOG_DIR": "other",\n  "extension": 7,\n  "LOG_LEVEL": "warn"\n}\n',
  );
});
it("rejects unknown names and invalid values without writing", async () => {
  const { settings, write } = fixture({ options: {}, environment: {}, configuration: {} });
  expect(() => settings.getSetting("NO_SUCH_SETTING")).toThrow("NO_SUCH_SETTING");
  await expect(settings.setSetting("NO_SUCH_SETTING", "x")).rejects.toMatchObject({
    kind: "usage",
  });
  await expect(settings.setSetting("LOG_LEVEL", "loud")).rejects.toMatchObject({
    kind: "rule",
    message: "Invalid setting: LOG_LEVEL",
  });
  expect(write).not.toHaveBeenCalled();
});
it("translates write failures without their contents", async () => {
  const settings = manageSettings({
    directory: "/project",
    sources: () => ({ options: {}, environment: {}, configuration: {} }),
    write: async () => {
      throw Error("private");
    },
  });
  await expect(settings.setSetting("LOG_LEVEL", "warn")).rejects.toMatchObject({
    kind: "unavailable",
    message: `Cannot write configuration: ${resolve("/project", "config.json")}`,
  });
});
