import { expect, test } from "vite-plus/test";
import { applicationHelp, commandHelp, settingOptions, shellOptions } from "./app.help.ts";
import { identity } from "#shared/identity.ts";
import type { CommandRegistration } from "#shared/output/command.type.ts";

const command: CommandRegistration = {
  name: "sample",
  summary: "Sample command",
  usage: "sample list",
  operations: [{ name: "list", summary: "List entries" }],
  options: [{ name: "format", placeholder: "format", summary: "Output format" }],
  run: async () => ({ data: {}, text: "" }),
};

test("application help lists registered commands and shell usage", () => {
  const help = applicationHelp([command]);
  expect(help.data).toEqual({
    name: identity.name,
    commands: [{ name: "sample", summary: "Sample command", usage: "sample list" }],
  });
  expect(help.text).toBe(
    `${identity.name}\n${identity.description}\nUsage: ${identity.name} <command> [options]\nsample  Sample command\nhelp  Show help`,
  );
});

test("command help combines shell, setting and command options", () => {
  const options = settingOptions([
    { name: "LOG_LEVEL", option: "log-level", fallback: "info", parse: String },
  ]);
  expect(options).toEqual([
    { name: "log-level", placeholder: "value", summary: "Set LOG_LEVEL", default: "info" },
  ]);
  const help = commandHelp(command, options);
  expect(help.data).toEqual({
    name: "sample",
    usage: "sample list",
    operations: command.operations,
    options: [...shellOptions, ...options, ...command.options],
  });
  expect(help.text).toBe(
    "Usage: sample list\nlist  List entries\n--help  Show help\n--json  Write one JSON object\n--version  Show the version\n--log-level <value>  Set LOG_LEVEL (default: info)\n--format <format>  Output format",
  );
});
