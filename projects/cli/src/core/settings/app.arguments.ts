import { ExpectedError } from "#shared/expected.error.ts";
import { parseArgs } from "node:util";
import type { SettingDefinition } from "#shared/settings/settings.type.ts";
import type { CommandOption } from "#shared/output/command.type.ts";
function optionType(placeholder: string | undefined) {
  const isFlag = placeholder === undefined;
  return isFlag ? ("boolean" as const) : ("string" as const);
}

export function parseShellArguments(
  args: string[],
  input: { definitions: readonly SettingDefinition[]; options: readonly CommandOption[] },
) {
  const settings = input.definitions.map(({ option }) => [option, { type: "string" as const }]);
  const declared = input.options.map(({ name, placeholder }) => [
    name,
    { type: optionType(placeholder) },
  ]);
  const options: Record<string, { type: "string" | "boolean" }> = Object.fromEntries([
    ...settings,
    ...declared,
  ]);
  try {
    const parsed = parseArgs({ args, options, allowPositionals: true });
    const values = Object.fromEntries(
      input.definitions.map(({ name, option }) => [name, parsed.values[option]]),
    );
    return { values, command: parsed.positionals, options: parsed.values };
  } catch {
    const unknown = args.find(
      (arg) => arg.startsWith("--") && !((arg.slice(2).split("=")[0] ?? "") in options),
    );
    const hasUnknown = unknown !== undefined;
    throw new ExpectedError(
      "usage",
      hasUnknown ? `Unknown option ${unknown.split("=")[0]}` : "Invalid command options",
    );
  }
}
