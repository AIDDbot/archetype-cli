import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { readSetting } from "../shared/settings.read.ts";
import { requireText } from "../shared/text.check.ts";

export const projectDirectory = fileURLToPath(new URL("../..", import.meta.url));
export type Configuration = Readonly<{
  databasePath: string;
  isVersion: boolean;
  arguments: readonly string[];
}>;

export function readConfiguration(
  argumentsList: string[],
  environment: NodeJS.ProcessEnv,
): Configuration {
  const { values, positionals } = parseArgs({
    args: argumentsList,
    allowPositionals: true,
    options: { version: { type: "boolean" }, "database-url": { type: "string" } },
  });
  const settings = { ...environment };
  if (values["database-url"] !== undefined) settings.DATABASE_URL = values["database-url"];
  const databasePath = readSetting(
    {
      name: "DATABASE_URL",
      fallback: "./data/cli.sqlite",
      parse: (value) => resolve(projectDirectory, requireText(value, "DATABASE_URL")),
    },
    settings,
  );
  return { databasePath, isVersion: values.version ?? false, arguments: positionals };
}
