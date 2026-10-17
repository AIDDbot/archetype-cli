import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readIdentity } from "./identity.search.ts";
import { createIdentity, isPackageIdentity, type PackageIdentity } from "./identity.value.ts";
import { isRecord } from "./checks.guard.ts";
function readWorkspace(directory: string): PackageIdentity | undefined {
  const path = join(directory, "package.json");
  if (!existsSync(path)) return undefined;
  const metadata: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!isRecord(metadata) || metadata.workspaces === undefined) return undefined;
  if (!isPackageIdentity(metadata)) throw new Error(`Invalid identity in ${path}`);
  return metadata;
}
export const identity = createIdentity(
  readIdentity(dirname(fileURLToPath(import.meta.url)), readWorkspace),
);
