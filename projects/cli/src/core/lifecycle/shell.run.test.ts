import { expect, it, vi } from "vitest";
import { runShell, type ShellInput } from "./shell.run.ts";
import type { Command } from "#shared/output/command.contract.ts";
const result = { text: "Done", json: { done: true } };
const command: Command = {
  name: "sample",
  summary: "Sample",
  usage: "sample [read]",
  operations: [{ name: "read", summary: "Read" }],
  options: [{ name: "path", placeholder: "file", summary: "Path" }],
  run: vi.fn<Command["run"]>(async () => result),
};
function fixture(name: string): ShellInput {
  return {
    identity: {
      displayName: "Test",
      description: "Test",
      version: "1.0.0",
      author: { name: "A", url: "u" },
    },
    commands: [command],
    parsed: { command: name, arguments: [], options: {} },
  };
}
it.each(["", "help"])("shows application help for %s", async (name) => {
  expect(await runShell(fixture(name))).toMatchObject({ json: { name: "Test" } });
});
it("shows help for help itself", async () => {
  const input = fixture("help");
  input.parsed.arguments = ["help"];
  expect(await runShell(input)).toMatchObject({ json: { name: "help" } });
});
it.each(["help", "sample"])("shows command help for %s", async (name) => {
  const input = fixture(name);
  input.parsed.options.help = true;
  const general = name === "help";
  input.parsed.arguments = general ? ["sample"] : [];
  expect(await runShell(input)).toMatchObject({ json: { name: "sample" } });
});
it("rejects unknown commands with help", async () => {
  await expect(runShell(fixture("unknown"))).rejects.toMatchObject({
    kind: "usage",
    fields: { usage: expect.stringContaining("Usage:") },
  });
});
it.each([[], ["read"]])("runs a declared command %j", async (...args) => {
  const input = fixture("sample");
  input.parsed.arguments = args;
  input.parsed.options.path = "x";
  expect(await runShell(input)).toEqual(result);
});
it.each([["wrong"], ["read", "extra"]])("rejects undeclared arguments %j", async (...args) => {
  const input = fixture("sample");
  input.parsed.arguments = args;
  await expect(runShell(input)).rejects.toMatchObject({ kind: "usage" });
});
it("rejects options declared by another command", async () => {
  const input = fixture("sample");
  input.parsed.options.other = "x";
  await expect(runShell(input)).rejects.toThrow("Unknown option: --other");
});

it("rejects extra help arguments", async () => {
  const input = fixture("help");
  input.parsed.arguments = ["sample", "extra"];
  await expect(runShell(input)).rejects.toMatchObject({ kind: "usage" });
});
it.each([["wrong"], ["read", "extra"]])(
  "validates arguments before command help %j",
  async (...args) => {
    const input = fixture("sample");
    input.parsed.arguments = args;
    input.parsed.options.help = true;
    await expect(runShell(input)).rejects.toMatchObject({
      kind: "usage",
      fields: { usage: expect.stringContaining(command.usage) },
    });
  },
);
it.each(["help", "sample"])("validates other registration options before %s help", async (name) => {
  const input = fixture(name);
  const general = name === "help";
  input.parsed.arguments = general ? ["sample"] : [];
  input.parsed.options = { help: true, other: "value" };
  input.commands = [
    command,
    {
      ...command,
      name: "second",
      options: [{ name: "other", placeholder: "value", summary: "Other" }],
    },
  ];
  await expect(runShell(input)).rejects.toMatchObject({
    kind: "usage",
    message: "Unknown option: --other",
    fields: { usage: expect.stringContaining(command.usage) },
  });
});
