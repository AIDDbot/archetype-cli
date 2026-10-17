import { expect, test, vi } from "vite-plus/test";
import { createConfigService } from "./config.service.ts";
import type { Settings } from "../../shared/settings/settings.type.ts";
function settings(set = vi.fn<Settings["set"]>(async () => {})): Settings {
  return {
    list: () => [{ name: "LOG_LEVEL", value: "debug", source: "argument" }],
    get: () => "debug",
    set,
  };
}
test("config returns data with the selected source", () => {
  const service = createConfigService(settings());
  const setting = { name: "LOG_LEVEL", value: "debug", source: "argument" };
  expect(service.get()).toEqual({ settings: [setting] });
  expect(service.get("LOG_LEVEL")).toEqual(setting);
  expect(() => service.get("missing")).toThrow("Unknown setting: missing");
});
test("config delegates persistence to its injected settings contract", async () => {
  const set = vi.fn<Settings["set"]>(async () => {});
  await createConfigService(settings(set)).set("LOG_LEVEL", "warn");
  expect(set).toHaveBeenCalledExactlyOnceWith("LOG_LEVEL", "warn");
});
