import type { Identity } from "#shared/identity.type.ts";
import type { Command, CommandResult } from "#shared/output/command.contract.ts";
import { definitions } from "#core/settings/settings.definitions.ts";
import { renderView } from "#shared/output/view.render.ts";

type HelpCommand = Pick<Command, "name" | "summary" | "usage" | "operations" | "options">;
export type HelpInput = {
  identity: Identity;
  commands: readonly Command[];
  command?: HelpCommand | undefined;
};
export const helpCommand = {
  name: "help",
  summary: "Show command help",
  usage: "help [command]",
  operations: [],
  options: [],
};
export function helpResult(input: HelpInput): Extract<CommandResult, { text: string }> {
  const commands = [helpCommand, ...input.commands];
  const command = input.command;
  const specific = command !== undefined;
  const settings = definitions.map(
    (item) => `  --${item.option} <value>  ${item.name} (default: ${String(item.fallback)})`,
  );
  const common = [
    "  --help  Show help",
    "  --json  Write JSON",
    "  --version  Show version",
    ...settings,
  ];
  const details = specific
    ? commandLines(command)
    : commands.map((item) => `  ${item.name}  ${item.summary}`);
  const usageLine = specific ? command.usage : "[options] [command]";
  const text = [
    input.identity.displayName,
    input.identity.description,
    `Usage: ${usageLine}`,
    ...details,
    ...common,
  ].join("\n");
  const json = specific
    ? {
        name: command.name,
        usage: command.usage,
        operations: command.operations,
        options: command.options,
      }
    : {
        name: input.identity.displayName,
        commands: commands.map(({ name, summary, usage }) => ({ name, summary, usage })),
      };
  return { text, json };
}
function commandLines(command: HelpCommand): string[] {
  const operations = command.operations.map((item) => `  ${item.name}  ${item.summary}`);
  const options = command.options.map(
    (item) =>
      `  --${item.name} <${item.placeholder}>  ${item.summary} (default: ${item.default ?? ""})`,
  );
  return [...operations, ...options];
}
export type RenderInput = { result: CommandResult; json: boolean; write: (text: string) => void };
export function render(input: RenderInput): void {
  const output = input.result;
  const isView = "kind" in output;
  const result = isView ? renderView(output) : output;
  const text = input.json ? JSON.stringify(result.json) : result.text;
  input.write(`${text}\n`);
}
