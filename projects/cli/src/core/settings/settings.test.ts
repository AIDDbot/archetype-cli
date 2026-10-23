import { expect, it } from "vitest";
import { configFile, logDirectory, logLevel } from "./settings.definitions.ts";
import { readConfiguration, readSetting } from "./settings.read.ts";

it.each(["", " ", 0, null, undefined, {}, []])("rejects invalid paths: %j", (value) => {
  expect(() => configFile.check(value)).toThrow("Invalid path setting");
  expect(() => logDirectory.check(value)).toThrow("Invalid path setting");
});
it.each(["debug", "info", "warn", "error"])("accepts log level %s", (value) => {
  expect(logLevel.check(value)).toBe(value);
});
it.each(["", "INFO", "trace", 0, null, undefined])("rejects invalid level %j", (value) => {
  expect(() => logLevel.check(value)).toThrow("Invalid LOG_LEVEL");
});
it("reads each source in order and excludes CONFIG_FILE from the file", () => {
  const sources = {
    options: { "log-dir": "option" },
    environment: { LOG_DIR: "environment" },
    configuration: { LOG_DIR: "file", CONFIG_FILE: "ignored" },
  };
  expect(readSetting(logDirectory, sources)).toBe("option");
  expect(readSetting(logDirectory, { ...sources, options: {} })).toBe("environment");
  expect(readSetting(logDirectory, { ...sources, options: {}, environment: {} })).toBe("file");
  expect(readSetting(logDirectory, { options: {}, environment: {}, configuration: {} })).toBe(
    "./logs",
  );
  expect(readSetting(configFile, { ...sources, options: {}, environment: {} })).toBe(
    "./config.json",
  );
  expect(logDirectory.check("relative")).toBe("relative");
});
it("validates explicit null values instead of using a lower source", () => {
  expect(() =>
    readSetting(logLevel, { options: { "log-level": null }, environment: {}, configuration: {} }),
  ).toThrow("Invalid LOG_LEVEL");
  expect(() =>
    readSetting(logDirectory, { options: {}, environment: {}, configuration: { LOG_DIR: null } }),
  ).toThrow("Invalid path setting");
});
it("reads an object or an absent configuration", async () => {
  await expect(
    readConfiguration({ path: "file", read: async () => '{"LOG_LEVEL":"debug"}' }),
  ).resolves.toEqual({ LOG_LEVEL: "debug" });
  await expect(readConfiguration({ path: "file", read: async () => undefined })).resolves.toEqual(
    {},
  );
});
it.each(["null", "[]", "1", '"value"', "{bad"])("rejects configuration %s", async (text) => {
  await expect(readConfiguration({ path: "file", read: async () => text })).rejects.toMatchObject({
    kind: "unavailable",
    message: "Cannot read configuration: file",
  });
});
it("translates a read failure", async () => {
  await expect(
    readConfiguration({
      path: "file",
      read: async () => {
        throw Error("private");
      },
    }),
  ).rejects.toMatchObject({ kind: "unavailable", message: "Cannot read configuration: file" });
});
