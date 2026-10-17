import { expect, test } from "vite-plus/test";
import { parseShellArguments } from "./app.arguments.ts";
import { definitions } from "./app.settings.ts";
import { shellOptions } from "./app.help.ts";
test("shell parses global flags and settings before the command", () => {
  const parsed = parseShellArguments(["--json", "--help", "--log-level", "debug", "config"], {
    definitions,
    options: shellOptions,
  });
  expect(parsed.command).toEqual(["config"]);
  expect(parsed.options).toMatchObject({ json: true, help: true });
  expect(parsed.values).toMatchObject({ LOG_LEVEL: "debug" });
});
test("shell parses a typed registration option without parsing help text", () => {
  const result = parseShellArguments(["sample", "--target", "there"], {
    definitions,
    options: [{ name: "target", placeholder: "path", summary: "Target path" }],
  });
  expect(result.options.target).toBe("there");
});
