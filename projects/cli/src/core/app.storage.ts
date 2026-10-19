import { readFile, writeFile } from "node:fs/promises";
import { isRecord } from "#shared/checks.guard.ts";
import { attempt } from "#shared/errors/expected.error.ts";
import type { TextFiles } from "#shared/files.type.ts";
import type { ConfigurationStorage } from "#shared/settings/configuration.type.ts";

export function createConfigurationStorage(files?: TextFiles): ConfigurationStorage {
  return {
    read: (path) => readConfiguration(files, path),
    write: (path, values) =>
      attempt(
        () => writeConfiguration(files, { path, content: `${JSON.stringify(values, null, 2)}\n` }),
        `Cannot write configuration ${path}`,
      ),
  };
}
async function readConfiguration(
  files: TextFiles | undefined,
  path: string,
): Promise<Record<string, unknown>> {
  return attempt(async () => {
    const content = await readOptional(files, path);
    const isMissing = content === undefined;
    if (isMissing) return {};
    const value: unknown = JSON.parse(content);
    if (!isRecord(value)) throw new Error("Expected an object");
    return value;
  }, `Cannot read configuration ${path}`);
}
async function readOptional(files: TextFiles | undefined, path: string) {
  try {
    return await (files ? files.read(path) : readFile(path, "utf8"));
  } catch (error) {
    const isMissing = isRecord(error) && error.code === "ENOENT";
    if (isMissing) return undefined;
    throw error;
  }
}
async function writeConfiguration(
  files: TextFiles | undefined,
  file: { path: string; content: string },
) {
  return files ? files.write(file.path, file.content) : writeFile(file.path, file.content, "utf8");
}
