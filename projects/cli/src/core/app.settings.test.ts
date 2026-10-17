import { expect, test } from "vite-plus/test";
import { resolve } from "node:path";
import { definitions, resolveSetting, selectLogging, selectSetting } from "./app.settings.ts";
test("settings select the first source and validate only that source", () => {
  const sources = {
    argument: { LOG_LEVEL: "debug" },
    environment: { LOG_LEVEL: "invalid" },
    file: { LOG_LEVEL: "warn" },
  };
  expect(selectSetting(definitions[2], sources)).toEqual({
    name: "LOG_LEVEL",
    value: "debug",
    source: "argument",
  });
  expect(() => selectSetting(definitions[2], { ...sources, argument: {} })).toThrow("LOG_LEVEL");
});
test("CONFIG_FILE ignores file values and defaults remain documented", () => {
  const sources = { argument: {}, environment: {}, file: { CONFIG_FILE: "other.json" } };
  expect(selectSetting(definitions[0], sources).value).toBe("./config.json");
  expect(selectSetting(definitions[2], sources).value).toBe("info");
});

test("paths select environment and file values and reject empty text", () => {
  const sources = {
    argument: {},
    environment: { LOG_DIR: "env-logs" },
    file: { LOG_DIR: "file-logs" },
  };
  expect(selectSetting(definitions[1], sources)).toEqual({
    name: "LOG_DIR",
    value: "env-logs",
    source: "environment",
  });
  expect(selectSetting(definitions[1], { ...sources, environment: {} }).value).toBe("file-logs");
  expect(
    selectSetting(definitions[0], { ...sources, argument: { CONFIG_FILE: "custom.json" } }).value,
  ).toBe("custom.json");
  expect(() => selectSetting(definitions[1], { ...sources, argument: { LOG_DIR: " " } })).toThrow(
    "LOG_DIR",
  );
});

test("path settings resolve against the working directory and levels remain unchanged", () => {
  const level = { name: "LOG_LEVEL", value: "debug", source: "argument" } as const;
  expect(resolveSetting(level, "/workspace")).toBe(level);
  expect(
    resolveSetting({ name: "LOG_DIR", value: "logs", source: "default" }, "/workspace").value,
  ).toBe(resolve("/workspace", "logs"));
});
test("logging settings skip the file for an invalid folder and take the fallback level", () => {
  const sources = { argument: { LOG_DIR: "" }, environment: { LOG_LEVEL: "loud" }, file: {} };
  expect(selectLogging(sources, "/project")).toEqual({ directory: undefined, level: "info" });
  const valid = { argument: { LOG_DIR: "out" }, environment: { LOG_LEVEL: "warn" }, file: {} };
  expect(selectLogging(valid, "/project")).toEqual({
    directory: resolve("/project", "out"),
    level: "warn",
  });
});
