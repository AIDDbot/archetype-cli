import type { Command, RegistrationInput } from "#shared/output/command.contract.ts";
import { configureSettings } from "./config.service.ts";
import { configResult } from "./config.command.ts";

export function registerConfig(input: RegistrationInput): readonly Command[] {
  return [
    {
      name: "config",
      summary: "Read and write settings",
      usage: "config get [name] | config set <name> <value>",
      operations: [
        { name: "get", summary: "Read settings", arguments: ["name"] },
        { name: "set", summary: "Write a setting", arguments: ["name", "value"] },
      ],
      options: [],
      run: async (command) =>
        configResult(await configureSettings({ ...command, settings: input.settings })),
    },
  ];
}
