import { join } from "node:path";
import { isRecord } from "#shared/checks.guard.ts";
import { readIdentity } from "#shared/identity.search.ts";
import { createIdentity, isPackageIdentity, type PackageIdentity } from "#shared/identity.value.ts";
import { packageFiles } from "./files.adapter.ts";

export interface PackageFiles {
  exists(path: string): boolean;
  read(path: string): string;
}

export function readWorkspace(directory: string, files: PackageFiles): PackageIdentity | undefined {
  const path = join(directory, "package.json");
  if (!files.exists(path)) return undefined;
  const metadata: unknown = JSON.parse(files.read(path));
  const isWorkspace = isRecord(metadata) && metadata.workspaces !== undefined;
  if (!isWorkspace) return undefined;
  if (!isPackageIdentity(metadata)) throw new Error(`Invalid identity in ${path}`);
  return metadata;
}

export function loadIdentity(directory: string, files: PackageFiles = packageFiles) {
  return createIdentity(readIdentity(directory, (folder) => readWorkspace(folder, files)));
}
