import { expect, it, vi } from "vitest";
import type { Command } from "#shared/output/command.contract.ts";
import { helpResult, render } from "./output.render.ts";
const identity = {
  displayName: "Fixture",
  description: "Description",
  version: "1.2.3",
  author: { name: "A", url: "https://example.com" },
};
const command: Command = {
  name: "sample",
  summary: "Sample summary",
  usage: "sample [operation]",
  operations: [{ name: "read", summary: "Read item" }],
  options: [
    { name: "path", placeholder: "file", summary: "File path", default: "x" },
    { name: "other", placeholder: "text", summary: "Other" },
  ],
  run: vi.fn<Command["run"]>(),
};
it("renders general help from identity, settings and ordered registrations", () => {
  const result = helpResult({ identity, commands: [command] });
  expect(result.text).toContain("Fixture\nDescription\nUsage:");
  expect(result.text).toContain("sample  Sample summary");
  expect(result.text).toContain("--log-dir <value>  LOG_DIR (default: ./logs)");
  expect(result.text).toContain("--version  Show version");
  expect(result.json).toMatchObject({
    name: "Fixture",
    commands: [{ name: "help" }, { name: "sample" }],
  });
});
it("renders command operations and typed options", () => {
  const result = helpResult({ identity, commands: [command], command });
  expect(result.text).toContain("Usage: sample [operation]");
  expect(result.text).toContain("read  Read item");
  expect(result.text).toContain("--path <file>  File path (default: x)");
  expect(result.text).toContain("--other <text>  Other (default: )");
  expect(result.json).toMatchObject({
    name: "sample",
    operations: command.operations,
    options: command.options,
  });
});
it.each([false, true])("writes one result in the selected format %s", (json) => {
  const write = vi.fn<(text: string) => void>();
  render({ result: { text: "Help", json: { name: "Fixture" } }, json, write });
  const expected = json ? '{"name":"Fixture"}\n' : "Help\n";
  expect(write).toHaveBeenCalledExactlyOnceWith(expected);
});
it.each([false, true])("renders typed views through the shell in format %s", (json) => {
  const write = vi.fn<(text: string) => void>();
  render({
    result: { kind: "record", fields: [{ key: "name", label: "Name" }], record: { name: "A" } },
    json,
    write,
  });
  const expected = json ? '{"name":"A"}\n' : "Name: A\n";
  expect(write).toHaveBeenCalledExactlyOnceWith(expected);
});
