import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { CliSettings } from "#shared/projects/cli.contract.ts";
import { isText } from "#shared/values/values.check.ts";

type Environment = Readonly<Record<string, string | undefined>>;

function requireSetting(value: unknown, name: string): string {
  const valid = isText(value);
  if (!valid) throw new Error(`Invalid ${name}`);
  return value;
}

function commandParts(command: string): string[] {
  const parts = command.match(/"[^"]*"|'[^']*'|[^\s]+/g) ?? [];
  return parts.map((part) => part.replace(/^["']|["']$/g, ""));
}

export function readCliSettings(environment: Environment): CliSettings {
  const directory = requireSetting(environment.CLI_DIRECTORY ?? "../cli", "CLI_DIRECTORY");
  const command = requireSetting(environment.CLI_START ?? "node src/app.main.ts", "CLI_START");
  const [executable, ...args] = commandParts(command);
  return {
    directory: resolve(fileURLToPath(new URL("../../", import.meta.url)), directory),
    executable: requireSetting(executable, "CLI_START"),
    arguments: args,
  };
}
