import { expect, test } from "vite-plus/test";
import { renderOutput } from "./app.output.ts";
import type { CommandResult } from "../shared/output/command.type.ts";

test("core renders typed views and preserves the declared machine response", () => {
  const result: CommandResult = {
    data: { settings: [{ name: "LOG_LEVEL", value: "info", source: "default" }] },
    view: { kind: "record", facts: [{ label: "Level", value: "info" }] },
  };
  expect(renderOutput(result, false)).toBe("Level: info");
  expect(renderOutput(result, true)).toBe(JSON.stringify(result.data));
});

test("core retains scalar values and suppresses empty text", () => {
  expect(renderOutput({ data: { value: "info" }, text: "info" }, false)).toBe("info");
  expect(renderOutput({ data: {}, text: "" }, false)).toBeUndefined();
});
