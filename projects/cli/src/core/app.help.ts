import type { Identity } from "#shared/identity.value.ts";
import type { CommandRegistration, CommandOption } from "#shared/output/command.type.ts";
import type { SettingDefinition } from "#shared/settings/settings.type.ts";
/** A help result: the data for `--json` and the text for a human. */
export interface HelpResult {
  data: object;
  text: string;
}
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
export function applicationHelp(
  commands: readonly CommandRegistration[],
  identity: Identity,
): HelpResult {
  const data = {
    name: identity.name,
    commands: commands.map(({ name, summary, usage }) => ({ name, summary, usage })),
  };
  const text = `${identity.name}\n${identity.description}\nUsage: ${identity.name} <command> [options]\n${data.commands.map((item) => `${item.name}  ${item.summary}`).join("\n")}\nhelp  Show help`;
  return { data, text };
}
function describeOption(option: CommandOption) {
  const hasPlaceholder = option.placeholder !== undefined;
  const hasDefault = option.default !== undefined;
  const placeholder = hasPlaceholder ? ` <${option.placeholder}>` : "";
  const fallback = hasDefault ? ` (default: ${option.default})` : "";
  return `--${option.name}${placeholder}  ${option.summary}${fallback}`;
}

export function commandHelp(
  command: CommandRegistration,
  options: readonly CommandOption[],
): HelpResult {
  const allOptions = [...shellOptions, ...options, ...command.options];
  const operations = command.operations.map((item) => `${item.name}  ${item.summary}`);
  const descriptions = allOptions.map(describeOption);
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
