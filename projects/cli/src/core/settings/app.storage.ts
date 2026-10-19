import { isRecord } from "#shared/values/checks.guard.ts";
import { attempt } from "#shared/expected.error.ts";
import type { TextFiles } from "#shared/settings/files.type.ts";
import type { ConfigurationStorage } from "#shared/settings/configuration.type.ts";
import { textFiles } from "#core/files.adapter.ts";

export function createConfigurationStorage(files: TextFiles = textFiles): ConfigurationStorage {
  return {
    read: (path) => readConfiguration(files, path),
    write: (path, values) =>
      attempt(
        () => files.write(path, `${JSON.stringify(values, null, 2)}\n`),
        `Cannot write configuration ${path}`,
      ),
  };
}
async function readConfiguration(files: TextFiles, path: string): Promise<Record<string, unknown>> {
  return attempt(async () => {
    const content = await readOptional(files, path);
    const isMissing = content === undefined;
    if (isMissing) return {};
    const value: unknown = JSON.parse(content);
    if (!isRecord(value)) throw new Error("Expected an object");
    return value;
  }, `Cannot read configuration ${path}`);
}
async function readOptional(files: TextFiles, path: string) {
  try {
    return await files.read(path);
  } catch (error) {
    const isMissing = isRecord(error) && error.code === "ENOENT";
    if (isMissing) return undefined;
    throw error;
  }
}
