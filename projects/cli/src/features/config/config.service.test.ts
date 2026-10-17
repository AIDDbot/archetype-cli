import { expect, test, vi } from "vite-plus/test";
import { createConfigService } from "./config.service.ts";
import type { Settings } from "../../shared/settings/settings.type.ts";
function settings(): Settings {
  return {
    list: () => [{ name: "LOG_LEVEL", value: "debug", source: "argument" }],
    get: () => "debug",
    set: vi.fn(async () => {}),
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
  const source = settings();
  await createConfigService(source).set("LOG_LEVEL", "warn");
  expect(source.set).toHaveBeenCalledExactlyOnceWith("LOG_LEVEL", "warn");
});
