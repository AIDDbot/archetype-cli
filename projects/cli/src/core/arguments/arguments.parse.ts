import { parseArgs, type ParseArgsConfig } from "node:util";
import { ExpectedError } from "#shared/expected.error.ts";
import type { Command } from "#shared/output/command.contract.ts";
import type { SettingDefinition } from "#shared/settings/settings.contract.ts";

export type ArgumentInput = {
  args: string[];
  definitions: readonly SettingDefinition[];
  commands?: readonly Command[];
  publish?: (options: Arguments["options"]) => void;
};
export type Arguments = {
  options: Record<string, string | boolean | undefined>;
  command: string;
  arguments: string[];
};
type OptionToken = { name: string; value: string | undefined; inlineValue: boolean | undefined };
type OptionCheck = { token: OptionToken; options: NonNullable<ParseArgsConfig["options"]> };

function invalidOption(input: OptionCheck): boolean {
  const { token, options } = input;
  const own = Object.hasOwn(options, token.name);
  const definition = own ? options[token.name] : undefined;
  const unknown = definition === undefined;
  if (unknown) return true;
  const boolean = definition.type === "boolean";
  if (boolean) return token.value !== undefined;
  const value = token.value ?? "";
  const missing = token.value === undefined;
  if (missing) return true;
  const separate = token.inlineValue === false;
  const ambiguous = value.startsWith("-") && value.length > 1;
  return separate && ambiguous;
}

export function parseArguments(input: ArgumentInput): Arguments {
  const settings = input.definitions.map((definition) => [definition.option, { type: "string" }]);
  const commands = input.commands ?? [];
  const declared = commands.flatMap((command) =>
    command.options.map((option) => [option.name, { type: "string" }]),
  );
  const options: NonNullable<ParseArgsConfig["options"]> = Object.fromEntries([
    ...settings,
    ...declared,
    ["help", { type: "boolean" }],
    ["json", { type: "boolean" }],
    ["version", { type: "boolean" }],
  ]);
  const result = parseArgs({
    args: input.args,
    options,
    allowPositionals: true,
    strict: false,
    tokens: true,
  });
  input.publish?.(result.values);
  const invalid = result.tokens.some((token) => {
    const option = token.kind === "option";
    return option && invalidOption({ token, options });
  });
  if (invalid) {
    throw new ExpectedError({ kind: "usage", message: "Invalid command arguments" });
  }
  return {
    options: result.values,
    command: result.positionals[0] ?? "",
    arguments: result.positionals.slice(1),
  };
}
