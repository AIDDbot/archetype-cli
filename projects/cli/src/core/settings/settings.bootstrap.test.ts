import { resolve } from "node:path";
import { expect, it } from "vitest";
import { loggingSettings } from "./settings.bootstrap.ts";

it("resolves paths from the project and uses default definitions", () => {
  expect(
    loggingSettings({
      directory: "/project",
      sources: { options: {}, environment: {}, configuration: {} },
    }),
  ).toEqual({ directory: resolve("/project", "logs"), level: "info" });
});
it("disables file writes for an invalid directory and falls back for invalid level", () => {
  expect(
    loggingSettings({
      directory: "/project",
      sources: {
        options: { "log-dir": "", "log-level": "bad" },
        environment: {},
        configuration: {},
      },
    }),
  ).toEqual({ directory: undefined, level: "info" });
});
it("uses the configuration after loading", () => {
  expect(
    loggingSettings({
      directory: "/project",
      sources: {
        options: {},
        environment: {},
        configuration: { LOG_DIR: "custom", LOG_LEVEL: "warn" },
      },
    }),
  ).toEqual({ directory: resolve("/project", "custom"), level: "warn" });
});
