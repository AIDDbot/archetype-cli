import { expect, test } from "vite-plus/test";
import { parseShellArguments } from "./app.arguments.ts";
import { definitions } from "./app.settings.ts";

test("arguments map options to settings and preserve command words", () => {
  const parsed = parseShellArguments(["config", "list", "--log-level", "debug"], {
    definitions,
    options: [],
  });
  expect(parsed.values).toEqual({ CONFIG_FILE: undefined, LOG_DIR: undefined, LOG_LEVEL: "debug" });
  expect(parsed.command).toEqual(["config", "list"]);
});

test("arguments reject unknown options and missing option values", () => {
  const input = { definitions, options: [] };
  expect(() => parseShellArguments(["--unknown"], input)).toThrow("Unknown option --unknown");
  expect(() => parseShellArguments(["--log-level"], input)).toThrow("Invalid command options");
});

test("shell arguments parse flags and options with values", () => {
  const parsed = parseShellArguments(["config", "--help", "--format", "text"], {
    definitions,
    options: [
      { name: "help", summary: "Help" },
      { name: "format", placeholder: "value", summary: "Format" },
    ],
  });
  expect(parsed.command).toEqual(["config"]);
  expect(parsed.options).toEqual({ help: true, format: "text" });
});
