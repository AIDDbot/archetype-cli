import { existsSync, statSync } from "node:fs";
import { resolve, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import type { CliSettings } from "../shared/projects/cli.type.ts";

const suiteDirectory = fileURLToPath(new URL("..", import.meta.url));

function readText(
  environment: NodeJS.ProcessEnv,
  setting: Readonly<{ name: string; fallback: string }>,
): string {
  const value = environment[setting.name] ?? setting.fallback;
  if (value.trim().length === 0) throw new Error(`${setting.name}: must contain text`);
  return value.trim();
}

function findExecutable(command: string, environment: NodeJS.ProcessEnv): boolean {
  const extensions =
    process.platform === "win32"
      ? ["", ...(environment.PATHEXT ?? ".EXE;.CMD;.BAT").split(";")]
      : [""];
  const directories = ["", ...(environment.PATH ?? "").split(delimiter)];
  return directories.some((directory) =>
    extensions.some((extension) => {
      const path = resolve(directory, command + extension);
      return existsSync(path) && statSync(path).isFile();
    }),
  );
}

export function readCliSettings(environment: NodeJS.ProcessEnv): CliSettings {
  const directory = resolve(
    suiteDirectory,
    readText(environment, { name: "CLI_DIRECTORY", fallback: "../cli" }),
  );
  if (!existsSync(directory)) throw new Error("CLI_DIRECTORY: directory does not exist");
  if (!statSync(directory).isDirectory()) throw new Error("CLI_DIRECTORY: must be a directory");
  const start = readText(environment, { name: "CLI_START", fallback: "npm start --silent --" });
  const isCommand =
    /^\s*(?:"[^"]*"|'[^']*'|[^\s'"]+)(?:\s+(?:"[^"]*"|'[^']*'|[^\s'"]+))*\s*$/u.test(start);
  if (!isCommand) throw new Error("CLI_START: has an unclosed quote");
  const tokens =
    start.match(/"[^"]*"|'[^']*'|\S+/gu)?.map((token) => token.replace(/^['"]|['"]$/gu, "")) ?? [];
  const command = tokens[0]!;
  if (!findExecutable(command, environment))
    throw new Error("CLI_START: executable does not exist");
  return { directory, command, arguments: tokens.slice(1) };
}
