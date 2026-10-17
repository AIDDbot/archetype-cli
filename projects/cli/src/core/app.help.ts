import { identity } from "../shared/identity.ts";
import type { CommandRegistration, CommandOption } from "../shared/output/command.type.ts";
import type { SettingDefinition } from "../shared/settings/settings.type.ts";
export const shellOptions: readonly CommandOption[] = [
  { name: "help", summary: "Show help" },
  { name: "json", summary: "Write one JSON object" },
  { name: "version", summary: "Show the version" },
];
export function settingOptions(definitions: readonly SettingDefinition[]): CommandOption[] {
  return definitions.map(({ option, name, fallback }) => ({
    name: option,
    placeholder: "value",
    summary: `Set ${name}`,
    default: fallback,
  }));
}
export function applicationHelp(commands: readonly CommandRegistration[]) {
  const data = {
    name: identity.name,
    commands: commands.map(({ name, summary, usage }) => ({ name, summary, usage })),
  };
  const text = `${identity.name}\n${identity.description}\nUsage: ${identity.name} <command> [options]\n${data.commands.map((item) => `${item.name}  ${item.summary}`).join("\n")}\nhelp  Show help`;
  return { data, text };
}
export function commandHelp(command: CommandRegistration, options: readonly CommandOption[]) {
  const allOptions = [...shellOptions, ...options, ...command.options];
  const operations = command.operations.map((item) => `${item.name}  ${item.summary}`);
  const descriptions = allOptions.map(
    (item) =>
      `--${item.name}${item.placeholder === undefined ? "" : ` <${item.placeholder}>`}  ${item.summary}${item.default === undefined ? "" : ` (default: ${item.default})`}`,
  );
  return {
    data: {
      name: command.name,
      usage: command.usage,
      operations: command.operations,
      options: allOptions,
    },
    text: [`Usage: ${command.usage}`, ...operations, ...descriptions].join("\n"),
  };
}
