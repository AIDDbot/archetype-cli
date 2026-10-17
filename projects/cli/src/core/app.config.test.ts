import { resolve } from "node:path";
import { expect, test, vi } from "vite-plus/test";
import { createSettings } from "./app.config.ts";
import type { ConfigurationStorage } from "../shared/settings/configuration.type.ts";

function fakeStorage() {
  return {
    read: vi.fn<ConfigurationStorage["read"]>(),
    write: vi.fn<ConfigurationStorage["write"]>(),
  };
}

test("settings load the selected file and expose resolved values", async () => {
  const storage = fakeStorage();
  storage.read.mockResolvedValue({ LOG_LEVEL: "warn", LOG_DIR: "file-logs" });
  const settings = await createSettings(
    {
      directory: "/workspace",
      sources: { argument: { CONFIG_FILE: "custom.json" }, environment: {}, file: {} },
    },
    storage,
  );
  expect(storage.read).toHaveBeenCalledWith(resolve("/workspace", "custom.json"));
  expect(settings.get("LOG_LEVEL")).toBe("warn");
  expect(settings.list()).toContainEqual({
    name: "LOG_DIR",
    value: resolve("/workspace", "file-logs"),
    source: "file",
  });
  expect(() => settings.get("UNKNOWN")).toThrow("setting");
});

test("settings validate updates and preserve other stored values", async () => {
  const storage = fakeStorage();
  storage.read.mockResolvedValue({ LOG_DIR: "saved-logs" });
  const settings = await createSettings(
    {
      directory: "/workspace",
      sources: { argument: {}, environment: {}, file: {} },
    },
    storage,
  );
  await settings.set("LOG_LEVEL", "debug");
  expect(storage.write).toHaveBeenCalledWith(resolve("/workspace", "config.json"), {
    LOG_DIR: "saved-logs",
    LOG_LEVEL: "debug",
  });
  await expect(settings.set("LOG_LEVEL", "invalid")).rejects.toThrow("LOG_LEVEL");
  await expect(settings.set("UNKNOWN", "value")).rejects.toThrow("setting");
  expect(storage.write).toHaveBeenCalledTimes(1);
});
