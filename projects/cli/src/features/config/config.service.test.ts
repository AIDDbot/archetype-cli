import { expect, it, vi } from "vitest";
import type { Settings, SettingValue } from "#shared/settings/settings.contract.ts";
import { configureSettings } from "./config.service.ts";
import { registerConfig } from "./config.routes.ts";

const entry: SettingValue = { name: "LOG_LEVEL", value: "info", source: "default" };
function fixture(): Settings {
  return {
    readSetting: (definition) => definition.fallback,
    listSettings: () => [entry],
    getSetting: () => entry,
    setSetting: vi.fn<Settings["setSetting"]>(async () => {}),
  };
}
it("gets all settings or one named setting", async () => {
  const settings = fixture();
  await expect(configureSettings({ settings, arguments: ["get"] })).resolves.toEqual({
    settings: [entry],
    single: false,
  });
  await expect(configureSettings({ settings, arguments: ["get", "LOG_LEVEL"] })).resolves.toEqual({
    settings: [entry],
    single: true,
  });
});
it("sets a complete value through the settings contract", async () => {
  const settings = fixture();
  await expect(
    configureSettings({ settings, arguments: ["set", "LOG_LEVEL", "warn"] }),
  ).resolves.toEqual({ settings: [], single: false });
  expect(settings.setSetting).toHaveBeenCalledExactlyOnceWith("LOG_LEVEL", "warn");
});
it.each([[], ["bad"], ["set"], ["set", "LOG_LEVEL"]])(
  "rejects incomplete command %j",
  async (...args) => {
    await expect(configureSettings({ settings: fixture(), arguments: args })).rejects.toMatchObject(
      { kind: "usage" },
    );
  },
);
it("registers the public command and renders its results", async () => {
  const identity = {
    displayName: "Fixture",
    description: "Fixture",
    version: "1",
    author: { name: "A", url: "u" },
  };
  const [command] = registerConfig({ identity, settings: fixture() });
  expect(command?.name).toBe("config");
  await expect(command?.run({ arguments: ["get"], options: {} })).resolves.toMatchObject({
    json: { settings: [entry] },
  });
  await expect(command?.run({ arguments: ["get", "LOG_LEVEL"], options: {} })).resolves.toEqual({
    text: "info",
    json: entry,
  });
});
