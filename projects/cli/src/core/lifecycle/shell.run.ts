import { ExpectedError } from "#shared/expected.error.ts";
import type { Command, CommandResult } from "#shared/output/command.contract.ts";
import type { Identity } from "#shared/identity.type.ts";
import type { Arguments } from "#core/arguments/arguments.parse.ts";
import { definitions } from "#core/settings/settings.definitions.ts";
import { helpResult, helpCommand } from "#core/output/output.render.ts";
export type ShellInput = { parsed: Arguments; identity: Identity; commands: readonly Command[] };
function usage(message: string, help: Extract<CommandResult, { text: string }>): never {
  throw new ExpectedError({ kind: "usage", message, fields: { usage: help.text } });
}
function validate(input: ShellInput, command: Command): void {
  const allowed = [
    "help",
    "json",
    ...definitions.map((item) => item.option),
    ...command.options.map((item) => item.name),
  ];
  const unknown = Object.keys(input.parsed.options).find((name) => !allowed.includes(name));
  const invalidOption = unknown !== undefined;
  const help = helpResult({ ...input, command });
  if (invalidOption) usage(`Unknown option: --${unknown}`, help);
  const argument = input.parsed.arguments[0];
  const known = command.operations.some((item) => item.name === argument);
  const hasArgument = argument !== undefined;
  const unknownArgument = hasArgument && !known;
  const operation = command.operations.find((item) => item.name === argument);
  const maximum = 1 + (operation?.arguments?.length ?? 0);
  const invalidArgument = input.parsed.arguments.length > maximum || unknownArgument;
  if (invalidArgument) usage("Invalid command arguments", help);
}
function select(input: ShellInput): Command | undefined {
  const name = input.parsed.command;
  const general = name === "" || name === "help";
  const target = general ? input.parsed.arguments[0] : name;
  const command = input.commands.find((item) => item.name === target);
  const builtin = target === "help";
  const absent = command === undefined;
  const named = target !== undefined;
  const unknown = named && absent;
  const missing = unknown && !builtin;
  if (missing) usage(`Unknown command: ${target}`, helpResult(input));
  return command;
}
export async function runShell(input: ShellInput): Promise<CommandResult> {
  validateHelp(input);
  const command = select(input);
  const absent = command === undefined;
  if (absent) return builtinHelp(input);
  const general = input.parsed.command === "help";
  const requested = input.parsed.options.help === true;
  const showHelp = general || requested;
  const args = general ? [] : input.parsed.arguments;
  validate({ ...input, parsed: { ...input.parsed, arguments: args } }, command);
  if (showHelp) return helpResult({ ...input, command });
  return command.run({ arguments: input.parsed.arguments, options: input.parsed.options });
}

function builtinHelp(input: ShellInput): CommandResult {
  const self = input.parsed.arguments[0] === "help";
  const help = input.parsed.command === "help";
  const flagged = help && input.parsed.options.help === true;
  const specific = self || flagged;
  return helpResult({ ...input, command: specific ? helpCommand : undefined });
}

function validateHelp(input: ShellInput): void {
  const builtin = input.parsed.command === "help";
  const empty = input.parsed.command === "";
  const general = builtin || empty;
  const extra = input.parsed.arguments.length > 1;
  const invalid = general && extra;
  if (invalid) usage("Invalid command arguments", helpResult(input));
}
